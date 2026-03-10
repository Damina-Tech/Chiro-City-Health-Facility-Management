import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    type: string;
    title: string;
    message: string;
    channel: 'EMAIL' | 'SMS';
    recipient?: string;
    metadata?: Record<string, unknown>;
  }) {
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

  async notifyLicenseExpiry(staffId: string, staffName: string, facilityName: string, expiryDate: Date) {
    return this.create({
      type: 'LICENSE_EXPIRY',
      title: 'License Expiring Soon',
      message: `Staff ${staffName} (${facilityName}) license expires on ${expiryDate.toISOString().split('T')[0]}.`,
      channel: 'EMAIL',
      metadata: { staffId, staffName, facilityName, expiryDate: expiryDate.toISOString() },
    });
  }

  async notifyStaffAssignment(staffName: string, facilityId: string, _assigneeName: string) {
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

  async notifyFacilityActivation(facilityId: string, facilityName: string) {
    return this.create({
      type: 'FACILITY_ACTIVATION',
      title: 'Facility Activated',
      message: `Facility ${facilityName} has been activated.`,
      channel: 'EMAIL',
      metadata: { facilityId, facilityName },
    });
  }

  async findAll(params?: { type?: string; limit?: number }) {
    return this.prisma.notification.findMany({
      where: params?.type ? { type: params.type } : undefined,
      orderBy: { createdAt: 'desc' },
      take: params?.limit ?? 50,
    });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }
}
