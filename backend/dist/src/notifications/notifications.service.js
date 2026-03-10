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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.notification.create({
            data: {
                type: data.type,
                title: data.title,
                message: data.message,
                channel: data.channel,
                recipient: data.recipient,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            },
        });
    }
    async notifyLicenseExpiry(staffId, staffName, facilityName, expiryDate) {
        return this.create({
            type: 'LICENSE_EXPIRY',
            title: 'License Expiring Soon',
            message: `Staff ${staffName} (${facilityName}) license expires on ${expiryDate.toISOString().split('T')[0]}.`,
            channel: 'EMAIL',
            metadata: { staffId, staffName, facilityName, expiryDate: expiryDate.toISOString() },
        });
    }
    async notifyStaffAssignment(staffName, facilityId, _assigneeName) {
        const facility = await this.prisma.facility.findUnique({
            where: { id: facilityId },
            select: { name: true },
        });
        return this.create({
            type: 'STAFF_ASSIGNMENT',
            title: 'Staff Assigned to Facility',
            message: `${staffName} has been assigned to ${facility?.name || 'facility'}.`,
            channel: 'EMAIL',
            metadata: { facilityId, staffName },
        });
    }
    async notifyFacilityActivation(facilityId, facilityName) {
        return this.create({
            type: 'FACILITY_ACTIVATION',
            title: 'Facility Activated',
            message: `Facility ${facilityName} has been activated.`,
            channel: 'EMAIL',
            metadata: { facilityId, facilityName },
        });
    }
    async findAll(params) {
        return this.prisma.notification.findMany({
            where: params?.type ? { type: params.type } : undefined,
            orderBy: { createdAt: 'desc' },
            take: params?.limit ?? 50,
        });
    }
    async markRead(id) {
        return this.prisma.notification.update({
            where: { id },
            data: { readAt: new Date() },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map