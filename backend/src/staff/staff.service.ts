import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ROLES } from '../common/constants';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

/** Officer may only use these staff statuses; Admin approves (e.g. APPROVED / ACTIVE). */
const OFFICER_ALLOWED_STAFF_STATUSES = new Set<string>(['DRAFT', 'SUBMITTED']);

@Injectable()
export class StaffService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  private serializeSpecificFields(fields: CreateStaffDto['specificFields']): string | null {
    if (!fields || !Object.keys(fields).length) return null;
    return JSON.stringify(fields);
  }

  private mapCreateData(dto: CreateStaffDto, userId?: string) {
    const name =
      dto.name?.trim() ||
      `${dto.firstName} ${dto.lastName}`.trim() ||
      dto.employeeId;
    return {
      employeeId: dto.employeeId,
      name,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender ?? undefined,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      nationalId: dto.nationalId ?? undefined,
      email: dto.email,
      phone: dto.phone ?? undefined,
      address: dto.address ?? undefined,
      department: dto.department ?? undefined,
      designation: dto.designation,
      staffRole: dto.staffRole ?? undefined,
      employmentType: dto.employmentType ?? undefined,
      facilityId: dto.facilityId ?? undefined,
      departmentName: dto.departmentName ?? undefined,
      licenseNo: dto.licenseNo ?? undefined,
      licenseIssueDate: dto.licenseIssueDate ? new Date(dto.licenseIssueDate) : undefined,
      licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,
      status: dto.status || 'DRAFT',
      joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
      emergencyContact: dto.emergencyContact ?? undefined,
      specificFields: this.serializeSpecificFields(dto.specificFields),
      createdBy: dto.createdBy ?? userId ?? undefined,
    };
  }

  async create(dto: CreateStaffDto, userId?: string, userRole?: string) {
    const effectiveDto =
      userRole === ROLES.OFFICER
        ? { ...dto, status: 'SUBMITTED' as const }
        : dto;
    const staff = await this.prisma.staff.create({
      data: this.mapCreateData(effectiveDto, userId),
    });
    await this.audit.log({
      action: 'CREATE',
      entity: 'Staff',
      entityId: staff.id,
      staffId: staff.id,
      userId,
      payload: { name: staff.name, employeeId: staff.employeeId },
    });
    if (effectiveDto.facilityId) {
      await this.prisma.staffAssignment.create({
        data: {
          staffId: staff.id,
          facilityId: effectiveDto.facilityId,
          department: effectiveDto.departmentName ?? effectiveDto.department,
          assignedBy: userId,
        },
      });
      await this.notifications.notifyStaffAssignment(staff.name, effectiveDto.facilityId, staff.name);
    }
    if (userRole === ROLES.OFFICER) {
      await this.notifications.notifyPendingStaffApproval(staff.id, staff.name, staff.employeeId);
    }
    return staff;
  }

  async findAll(params?: { search?: string; status?: string; facilityId?: string }) {
    const where: any = {};
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { employeeId: { contains: params.search, mode: 'insensitive' } },
        { nationalId: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params?.status) where.status = params.status;
    if (params?.facilityId) where.facilityId = params.facilityId;

    return this.prisma.staff.findMany({
      where,
      include: {
        facility: { select: { id: true, name: true, type: true } },
        _count: { select: { documents: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: {
        facility: true,
        documents: true,
        assignments: { include: { facility: true } },
      },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return {
      ...staff,
      specificFields: staff.specificFields ? JSON.parse(staff.specificFields) : null,
    };
  }

  async update(id: string, dto: UpdateStaffDto, userId?: string, userRole?: string) {
    const existing = await this.prisma.staff.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Staff not found');

    if (dto.status !== undefined && userRole === ROLES.OFFICER && !OFFICER_ALLOWED_STAFF_STATUSES.has(dto.status)) {
      throw new ForbiddenException(
        'Officer can only set staff status to DRAFT or SUBMITTED. Only Admin can approve or activate.',
      );
    }

    const data: any = {};
    if (dto.employeeId !== undefined) data.employeeId = dto.employeeId;
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.firstName !== undefined || dto.lastName !== undefined || dto.name !== undefined) {
      const fn = dto.firstName !== undefined ? dto.firstName : existing.firstName;
      const ln = dto.lastName !== undefined ? dto.lastName : existing.lastName;
      const combined = [fn, ln].filter(Boolean).join(' ').trim();
      if (combined) data.name = combined;
      else if (dto.name !== undefined) data.name = dto.name;
    } else if (dto.name !== undefined) {
      data.name = dto.name;
    }
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) data.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    if (dto.nationalId !== undefined) data.nationalId = dto.nationalId;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.department !== undefined) data.department = dto.department;
    if (dto.designation !== undefined) data.designation = dto.designation;
    if (dto.staffRole !== undefined) data.staffRole = dto.staffRole;
    if (dto.employmentType !== undefined) data.employmentType = dto.employmentType;
    if (dto.facilityId !== undefined) data.facilityId = dto.facilityId;
    if (dto.departmentName !== undefined) data.departmentName = dto.departmentName;
    if (dto.licenseNo !== undefined) data.licenseNo = dto.licenseNo;
    if (dto.licenseIssueDate !== undefined) data.licenseIssueDate = dto.licenseIssueDate ? new Date(dto.licenseIssueDate) : null;
    if (dto.licenseExpiry !== undefined) data.licenseExpiry = dto.licenseExpiry ? new Date(dto.licenseExpiry) : null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.joiningDate !== undefined) data.joiningDate = dto.joiningDate ? new Date(dto.joiningDate) : null;
    if (dto.emergencyContact !== undefined) data.emergencyContact = dto.emergencyContact;
    if (dto.specificFields !== undefined) data.specificFields = this.serializeSpecificFields(dto.specificFields);

    const staff = await this.prisma.staff.update({
      where: { id },
      data,
    });

    if (dto.facilityId && dto.facilityId !== existing.facilityId) {
      await this.prisma.staffAssignment.upsert({
        where: {
          staffId_facilityId: { staffId: id, facilityId: dto.facilityId },
        },
        create: {
          staffId: id,
          facilityId: dto.facilityId,
          department: dto.departmentName ?? dto.department,
          assignedBy: userId,
        },
        update: {
          department: dto.departmentName ?? dto.department,
          assignedBy: userId,
        },
      });
      await this.notifications.notifyStaffAssignment(staff.name, dto.facilityId, staff.name);
    }

    await this.audit.log({
      action: 'UPDATE',
      entity: 'Staff',
      entityId: id,
      staffId: id,
      userId,
      payload: { name: staff.name },
    });
    return staff;
  }

  async remove(id: string, userId?: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff) throw new NotFoundException('Staff not found');
    await this.prisma.staff.delete({ where: { id } });
    await this.audit.log({
      action: 'DELETE',
      entity: 'Staff',
      entityId: id,
      userId,
      payload: { name: staff.name },
    });
    return { deleted: true };
  }

  async findLicenseExpiringWithin(days: number) {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);
    return this.prisma.staff.findMany({
      where: {
        licenseExpiry: { gte: from, lte: to },
        status: 'ACTIVE',
      },
      include: { facility: { select: { name: true } } },
    });
  }
}
