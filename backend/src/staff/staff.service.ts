import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateStaffDto, userId?: string) {
    const staff = await this.prisma.staff.create({
      data: {
        employeeId: dto.employeeId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        department: dto.department,
        designation: dto.designation,
        facilityId: dto.facilityId,
        departmentName: dto.departmentName,
        licenseNo: dto.licenseNo,
        licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : null,
        status: dto.status || 'DRAFT',
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : null,
        address: dto.address,
        emergencyContact: dto.emergencyContact,
      },
    });
    await this.audit.log({
      action: 'CREATE',
      entity: 'Staff',
      entityId: staff.id,
      staffId: staff.id,
      userId,
      payload: { name: staff.name, employeeId: staff.employeeId },
    });
    if (dto.facilityId) {
      await this.prisma.staffAssignment.create({
        data: {
          staffId: staff.id,
          facilityId: dto.facilityId,
          department: dto.departmentName ?? dto.department,
          assignedBy: userId,
        },
      });
      await this.notifications.notifyStaffAssignment(staff.name, dto.facilityId, staff.name);
    }
    return staff;
  }

  async findAll(params?: { search?: string; status?: string; facilityId?: string }) {
    const where: any = {};
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { employeeId: { contains: params.search, mode: 'insensitive' } },
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
    return staff;
  }

  async update(id: string, dto: UpdateStaffDto, userId?: string) {
    const existing = await this.prisma.staff.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Staff not found');

    const staff = await this.prisma.staff.update({
      where: { id },
      data: {
        ...(dto.employeeId && { employeeId: dto.employeeId }),
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.designation && { designation: dto.designation }),
        ...(dto.facilityId !== undefined && { facilityId: dto.facilityId }),
        ...(dto.departmentName !== undefined && { departmentName: dto.departmentName }),
        ...(dto.licenseNo !== undefined && { licenseNo: dto.licenseNo }),
        ...(dto.licenseExpiry !== undefined && {
          licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : null,
        }),
        ...(dto.status && { status: dto.status }),
        ...(dto.joiningDate !== undefined && {
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : null,
        }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.emergencyContact !== undefined && { emergencyContact: dto.emergencyContact }),
      },
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
      staffId: id,
      userId,
      payload: { name: staff.name },
    });
    return { deleted: true };
  }

  /** Staff with license expiring within days */
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
