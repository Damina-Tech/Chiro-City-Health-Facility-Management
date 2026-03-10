import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(input: AuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        facilityId: input.facilityId,
        staffId: input.staffId,
        userId: input.userId,
        payload: input.payload ? JSON.stringify(input.payload) : null,
      },
    });
  }
}
