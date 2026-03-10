import { PrismaService } from '../prisma/prisma.service';
export interface AuditLogInput {
    action: string;
    entity: string;
    entityId?: string;
    facilityId?: string;
    staffId?: string;
    userId?: string;
    payload?: Record<string, unknown>;
}
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(input: AuditLogInput): Promise<void>;
}
