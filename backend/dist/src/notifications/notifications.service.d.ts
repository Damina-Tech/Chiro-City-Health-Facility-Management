import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        type: string;
        title: string;
        message: string;
        channel: 'EMAIL' | 'SMS';
        recipient?: string;
        metadata?: Record<string, unknown>;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        message: string;
        channel: string;
        recipient: string | null;
        sentAt: Date | null;
        readAt: Date | null;
        metadata: string | null;
    }>;
    notifyLicenseExpiry(staffId: string, staffName: string, facilityName: string, expiryDate: Date): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        message: string;
        channel: string;
        recipient: string | null;
        sentAt: Date | null;
        readAt: Date | null;
        metadata: string | null;
    }>;
    notifyStaffAssignment(staffName: string, facilityId: string, _assigneeName: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        message: string;
        channel: string;
        recipient: string | null;
        sentAt: Date | null;
        readAt: Date | null;
        metadata: string | null;
    }>;
    notifyFacilityActivation(facilityId: string, facilityName: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        message: string;
        channel: string;
        recipient: string | null;
        sentAt: Date | null;
        readAt: Date | null;
        metadata: string | null;
    }>;
    findAll(params?: {
        type?: string;
        limit?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        message: string;
        channel: string;
        recipient: string | null;
        sentAt: Date | null;
        readAt: Date | null;
        metadata: string | null;
    }[]>;
    markRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        message: string;
        channel: string;
        recipient: string | null;
        sentAt: Date | null;
        readAt: Date | null;
        metadata: string | null;
    }>;
}
