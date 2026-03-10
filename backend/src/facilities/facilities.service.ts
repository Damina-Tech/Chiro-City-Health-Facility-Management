import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private serializeServices(services: string[] | undefined): string | null {
    if (!services?.length) return null;
    return JSON.stringify(services);
  }

  private serializeLegalInfo(legalInfo: Record<string, unknown> | undefined): string | null {
    if (!legalInfo || !Object.keys(legalInfo).length) return null;
    return JSON.stringify(legalInfo);
  }

  async create(dto: CreateFacilityDto, userId?: string) {
    const facility = await this.prisma.facility.create({
      data: {
        name: dto.name,
        type: dto.type,
        registrationNo: dto.registrationNo,
        licenseNo: dto.licenseNo,
        licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : null,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        status: dto.status || 'DRAFT',
        services: this.serializeServices(dto.services),
        legalInfo: this.serializeLegalInfo(dto.legalInfo),
      },
    });
    await this.audit.log({
      action: 'CREATE',
      entity: 'Facility',
      entityId: facility.id,
      userId,
      payload: { name: facility.name, type: facility.type },
    });
    return facility;
  }

  async findAll(params?: { search?: string; status?: string; type?: string }) {
    const where: any = {};
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { registrationNo: { contains: params.search, mode: 'insensitive' } },
        { licenseNo: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params?.status) where.status = params.status;
    if (params?.type) where.type = params.type;

    return this.prisma.facility.findMany({
      where,
      include: {
        _count: { select: { documents: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const facility = await this.prisma.facility.findUnique({
      where: { id },
      include: {
        documents: true,
        staff: { include: { staff: true } },
      },
    });
    if (!facility) throw new NotFoundException('Facility not found');
    const staffList = await this.prisma.staff.findMany({
      where: { facilityId: id },
      include: { documents: true },
    });
    return {
      ...facility,
      staffList,
      services: facility.services ? JSON.parse(facility.services) : [],
      legalInfo: facility.legalInfo ? JSON.parse(facility.legalInfo) : null,
    };
  }

  async getStaff(id: string) {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    if (!facility) throw new NotFoundException('Facility not found');
    return this.prisma.staff.findMany({
      where: { facilityId: id },
      include: { documents: true },
    });
  }

  async update(id: string, dto: UpdateFacilityDto, userId?: string) {
    const existing = await this.prisma.facility.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Facility not found');
    const facility = await this.prisma.facility.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.registrationNo !== undefined && { registrationNo: dto.registrationNo }),
        ...(dto.licenseNo !== undefined && { licenseNo: dto.licenseNo }),
        ...(dto.licenseExpiry !== undefined && {
          licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : null,
        }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.status && { status: dto.status }),
        ...(dto.services !== undefined && { services: this.serializeServices(dto.services) }),
        ...(dto.legalInfo !== undefined && { legalInfo: this.serializeLegalInfo(dto.legalInfo) }),
      },
    });
    await this.audit.log({
      action: 'UPDATE',
      entity: 'Facility',
      entityId: id,
      facilityId: id,
      userId,
      payload: { name: facility.name },
    });
    return facility;
  }

  async remove(id: string, userId?: string) {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    if (!facility) throw new NotFoundException('Facility not found');
    await this.prisma.facility.delete({ where: { id } });
    await this.audit.log({
      action: 'DELETE',
      entity: 'Facility',
      entityId: id,
      facilityId: id,
      userId,
      payload: { name: facility.name },
    });
    return { deleted: true };
  }
}
