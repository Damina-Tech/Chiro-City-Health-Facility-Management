import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(type?: string, limit?: string): Promise<{
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
