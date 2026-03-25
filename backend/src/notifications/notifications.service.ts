import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';

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

  async notifyPendingFacilityApproval(facilityId: string, facilityName: string) {
    return this.create({
      type: 'FACILITY_PENDING_APPROVAL',
      title: 'Facility pending approval',
      message: `"${facilityName}" was submitted by an officer and awaits admin approval.`,
      channel: 'EMAIL',
      metadata: { facilityId, facilityName },
    });
  }

  async notifyPendingStaffApproval(staffId: string, staffName: string, employeeId: string) {
    return this.create({
      type: 'STAFF_PENDING_APPROVAL',
      title: 'Staff pending approval',
      message: `${staffName} (${employeeId}) was submitted by an officer and awaits admin approval.`,
      channel: 'EMAIL',
      metadata: { staffId, staffName, employeeId },
    });
  }

  async findAll(params: { user: JwtPayload; type?: string; limit?: number }) {
    const { user, type, limit } = params;
    const where: any = {};
    if (type) where.type = type;

    // Recipient conventions:
    // - null => broadcast to everyone (legacy/system)
    // - "user:<id>" => only that user
    // - "role:<roleName>" => only that role (exact match)
    // - "email:<email>" => only that email
    where.OR = [
      { recipient: null },
      { recipient: `user:${user.sub}` },
      { recipient: `email:${user.email}` },
      { recipient: `role:${user.role}` },
    ];

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ?? 50,
    });
  }

  async markRead(id: string, user: JwtPayload) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) {
      // Prisma will throw on update anyway; keep behavior consistent
      return this.prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });
    }

    const isRecipient =
      notif.recipient == null ||
      notif.recipient === `user:${user.sub}` ||
      notif.recipient === `email:${user.email}` ||
      notif.recipient === `role:${user.role}`;

    // Only recipients can mark read (admins can always mark)
    if (!isRecipient && user.role !== 'Admin') {
      throw new ForbiddenException('Forbidden resource');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async broadcast(dto: BroadcastNotificationDto, sender: JwtPayload) {
    const type = dto.type || 'ANNOUNCEMENT';

    const users =
      dto.audience === 'ALL'
        ? await this.prisma.user.findMany({ select: { id: true, email: true, role: { select: { name: true } } } })
        : await this.prisma.user.findMany({
            where: { role: { name: dto.role } },
            select: { id: true, email: true, role: { select: { name: true } } },
          });

    const notificationsToCreate: any[] = [];
    for (const u of users) {
      if (dto.inApp) {
        notificationsToCreate.push({
          type,
          title: dto.title,
          message: dto.message,
          channel: 'IN_APP',
          recipient: `user:${u.id}`,
          metadata: JSON.stringify({ broadcast: true, senderId: sender.sub }),
        });
      }
      if (dto.email) {
        // Email sending is not yet integrated; we still create an EMAIL notification record per user.
        notificationsToCreate.push({
          type,
          title: dto.title,
          message: dto.message,
          channel: 'EMAIL',
          recipient: `email:${u.email}`,
          sentAt: new Date(),
          metadata: JSON.stringify({ broadcast: true, senderId: sender.sub }),
        });
      }
    }

    if (notificationsToCreate.length === 0) {
      return { created: 0, recipients: users.length };
    }

    const created = await this.prisma.notification.createMany({
      data: notificationsToCreate,
    });
    return { created: created.count, recipients: users.length };
  }
}
