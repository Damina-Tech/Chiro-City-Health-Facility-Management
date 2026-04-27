import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { ROLES } from '../common/constants';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  private async usersByRoleName(roleName: string) {
    return this.prisma.user.findMany({
      where: { role: { name: roleName } },
      select: { id: true, email: true },
    });
  }

  private async createInAppForUsers(data: {
    type: string;
    title: string;
    message: string;
    userIds: string[];
    metadata?: Record<string, unknown>;
  }) {
    if (!data.userIds.length) return { created: 0 };

    const notif = await this.prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        channel: 'IN_APP',
        recipient: null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    await this.prisma.notificationRecipient.createMany({
      data: data.userIds.map((userId) => ({
        notificationId: notif.id,
        userId,
      })),
      skipDuplicates: true,
    });

    return notif;
  }

  async create(data: {
    type: string;
    title: string;
    message: string;
    channel: 'EMAIL' | 'SMS' | 'IN_APP';
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
    const admins = await this.usersByRoleName(ROLES.ADMIN);
    return this.createInAppForUsers({
      type: 'FACILITY_PENDING_APPROVAL',
      title: 'Facility pending approval',
      message: `"${facilityName}" was submitted by an officer and awaits admin approval.`,
      userIds: admins.map((u) => u.id),
      metadata: { facilityId, facilityName },
    });
  }

  async notifyPendingStaffApproval(staffId: string, staffName: string, employeeId: string) {
    const admins = await this.usersByRoleName(ROLES.ADMIN);
    return this.createInAppForUsers({
      type: 'STAFF_PENDING_APPROVAL',
      title: 'Staff pending approval',
      message: `${staffName} (${employeeId}) was submitted by an officer and awaits admin approval.`,
      userIds: admins.map((u) => u.id),
      metadata: { staffId, staffName, employeeId },
    });
  }

  async findAll(params: { user: JwtPayload; type?: string; limit?: number }) {
    const { user, type, limit } = params;
    const rows = await this.prisma.notificationRecipient.findMany({
      where: {
        userId: user.sub,
        notification: type ? { type } : undefined,
      },
      include: { notification: true },
      orderBy: { deliveredAt: 'desc' },
      take: limit ?? 50,
    });

    // Backward-compatible response shape for frontend (notification + per-user readAt)
    return rows.map((r) => ({
      ...r.notification,
      readAt: r.readAt,
      recipient: `user:${user.sub}`,
      sentAt: r.notification.sentAt ?? r.deliveredAt,
    }));
  }

  async markRead(id: string, user: JwtPayload) {
    const rec = await this.prisma.notificationRecipient.findUnique({
      where: {
        notificationId_userId: { notificationId: id, userId: user.sub },
      },
      include: { notification: true },
    });
    if (!rec) {
      throw new ForbiddenException('Forbidden resource');
    }

    const updated = await this.prisma.notificationRecipient.update({
      where: {
        notificationId_userId: { notificationId: id, userId: user.sub },
      },
      data: { readAt: new Date() },
    });

    return {
      ...rec.notification,
      readAt: updated.readAt,
      recipient: `user:${user.sub}`,
      sentAt: rec.notification.sentAt ?? rec.deliveredAt,
    };
  }

  async clearAll(user: JwtPayload) {
    const result = await this.prisma.notificationRecipient.deleteMany({
      where: { userId: user.sub },
    });
    return { cleared: result.count };
  }

  async removeOne(id: string, user: JwtPayload) {
    const rec = await this.prisma.notificationRecipient.findUnique({
      where: {
        notificationId_userId: { notificationId: id, userId: user.sub },
      },
      select: { notificationId: true },
    });

    if (!rec) {
      throw new ForbiddenException('Forbidden resource');
    }

    await this.prisma.notificationRecipient.delete({
      where: {
        notificationId_userId: { notificationId: id, userId: user.sub },
      },
    });

    return { deleted: true };
  }

  async broadcast(dto: BroadcastNotificationDto, sender: JwtPayload) {
    const type = dto.type || 'ANNOUNCEMENT';

    const users =
      dto.audience === 'ALL'
        ? await this.prisma.user.findMany({ select: { id: true, email: true } })
        : await this.prisma.user.findMany({
            where: { role: { name: dto.role } },
            select: { id: true, email: true },
          });

    const userIds = users.map((u) => u.id);
    let created = 0;

    if (dto.inApp) {
      await this.createInAppForUsers({
        type,
        title: dto.title,
        message: dto.message,
        userIds,
        metadata: { broadcast: true, senderId: sender.sub },
      });
      created += 1;
    }

    if (dto.email) {
      // No SMTP yet: record an EMAIL notification intent.
      await this.prisma.notification.create({
        data: {
          type,
          title: dto.title,
          message: dto.message,
          channel: 'EMAIL',
          recipient: null,
          sentAt: new Date(),
          metadata: JSON.stringify({ broadcast: true, senderId: sender.sub }),
        },
      });
      created += 1;
    }

    return { created, recipients: users.length };
  }
}
