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

  private serializeSpecificFields(specificFields: CreateFacilityDto['specificFields']): string | null {
    if (!specificFields || !Object.keys(specificFields).length) return null;
    return JSON.stringify(specificFields);
  }

  private mapCreateDtoToData(dto: CreateFacilityDto, createdBy?: string) {
    return {
      name: dto.name,
      type: dto.type,
      ownershipType: dto.ownershipType ?? undefined,
      registrationNo: dto.registrationNo ?? undefined,
      tin: dto.tin ?? undefined,
      description: dto.description ?? undefined,
      region: dto.region ?? undefined,
      city: dto.city ?? undefined,
      woreda: dto.woreda ?? undefined,
      kebele: dto.kebele ?? undefined,
      streetAddress: dto.streetAddress ?? undefined,
      gpsLat: dto.gpsLat ?? undefined,
      gpsLng: dto.gpsLng ?? undefined,
      phone: dto.phone ?? undefined,
      altPhone: dto.altPhone ?? undefined,
      email: dto.email ?? undefined,
      website: dto.website ?? undefined,
      licenseNo: dto.licenseNo ?? undefined,
      licenseIssueDate: dto.licenseIssueDate ? new Date(dto.licenseIssueDate) : undefined,
      licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,
      regulatoryAuthority: dto.regulatoryAuthority ?? undefined,
      accreditationLevel: dto.accreditationLevel ?? undefined,
      operatingHours: dto.operatingHours ?? undefined,
      status: dto.status || 'DRAFT',
      approvalStatus: dto.approvalStatus ?? undefined,
      address: dto.address ?? undefined,
      services: this.serializeServices(dto.services),
      legalInfo: this.serializeLegalInfo(dto.legalInfo),
      specificFields: this.serializeSpecificFields(dto.specificFields),
      createdBy: dto.createdBy ?? createdBy ?? undefined,
    };
  }

  async create(dto: CreateFacilityDto, userId?: string) {
    const facility = await this.prisma.facility.create({
      data: this.mapCreateDtoToData(dto, userId),
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
        { tin: { contains: params.search, mode: 'insensitive' } },
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
      specificFields: facility.specificFields ? JSON.parse(facility.specificFields) : null,
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

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.ownershipType !== undefined) data.ownershipType = dto.ownershipType;
    if (dto.registrationNo !== undefined) data.registrationNo = dto.registrationNo;
    if (dto.tin !== undefined) data.tin = dto.tin;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.region !== undefined) data.region = dto.region;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.woreda !== undefined) data.woreda = dto.woreda;
    if (dto.kebele !== undefined) data.kebele = dto.kebele;
    if (dto.streetAddress !== undefined) data.streetAddress = dto.streetAddress;
    if (dto.gpsLat !== undefined) data.gpsLat = dto.gpsLat;
    if (dto.gpsLng !== undefined) data.gpsLng = dto.gpsLng;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.altPhone !== undefined) data.altPhone = dto.altPhone;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.website !== undefined) data.website = dto.website;
    if (dto.licenseNo !== undefined) data.licenseNo = dto.licenseNo;
    if (dto.licenseIssueDate !== undefined) data.licenseIssueDate = dto.licenseIssueDate ? new Date(dto.licenseIssueDate) : null;
    if (dto.licenseExpiry !== undefined) data.licenseExpiry = dto.licenseExpiry ? new Date(dto.licenseExpiry) : null;
    if (dto.regulatoryAuthority !== undefined) data.regulatoryAuthority = dto.regulatoryAuthority;
    if (dto.accreditationLevel !== undefined) data.accreditationLevel = dto.accreditationLevel;
    if (dto.operatingHours !== undefined) data.operatingHours = dto.operatingHours;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.approvalStatus !== undefined) data.approvalStatus = dto.approvalStatus;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.services !== undefined) data.services = this.serializeServices(dto.services);
    if (dto.legalInfo !== undefined) data.legalInfo = this.serializeLegalInfo(dto.legalInfo);
    if (dto.specificFields !== undefined) data.specificFields = this.serializeSpecificFields(dto.specificFields);

    const facility = await this.prisma.facility.update({
      where: { id },
      data,
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
    // Do not set facilityId: the facility no longer exists; entityId identifies what was deleted
    await this.audit.log({
      action: 'DELETE',
      entity: 'Facility',
      entityId: id,
      userId,
      payload: { name: facility.name },
    });
    return { deleted: true };
  }
}
