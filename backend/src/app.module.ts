import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { StaffModule } from './staff/staff.module';
import { FacilityDocumentsModule } from './facility-documents/facility-documents.module';
import { StaffDocumentsModule } from './staff-documents/staff-documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { DashboardController } from './dashboard/dashboard.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
    PrismaModule,
    AuthModule,
    AuditModule,
    FacilitiesModule,
    StaffModule,
    FacilityDocumentsModule,
    StaffDocumentsModule,
    NotificationsModule,
  ],
  controllers: [DashboardController],
})
export class AppModule {}
