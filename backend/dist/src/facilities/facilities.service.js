"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let FacilitiesService = class FacilitiesService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    serializeServices(services) {
        if (!services?.length)
            return null;
        return JSON.stringify(services);
    }
    serializeLegalInfo(legalInfo) {
        if (!legalInfo || !Object.keys(legalInfo).length)
            return null;
        return JSON.stringify(legalInfo);
    }
    async create(dto, userId) {
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
    async findAll(params) {
        const where = {};
        if (params?.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { registrationNo: { contains: params.search, mode: 'insensitive' } },
                { licenseNo: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (params?.status)
            where.status = params.status;
        if (params?.type)
            where.type = params.type;
        return this.prisma.facility.findMany({
            where,
            include: {
                _count: { select: { documents: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(id) {
        const facility = await this.prisma.facility.findUnique({
            where: { id },
            include: {
                documents: true,
                staff: { include: { staff: true } },
            },
        });
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
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
    async getStaff(id) {
        const facility = await this.prisma.facility.findUnique({ where: { id } });
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        return this.prisma.staff.findMany({
            where: { facilityId: id },
            include: { documents: true },
        });
    }
    async update(id, dto, userId) {
        const existing = await this.prisma.facility.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Facility not found');
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
    async remove(id, userId) {
        const facility = await this.prisma.facility.findUnique({ where: { id } });
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
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
};
exports.FacilitiesService = FacilitiesService;
exports.FacilitiesService = FacilitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], FacilitiesService);
//# sourceMappingURL=facilities.service.js.map