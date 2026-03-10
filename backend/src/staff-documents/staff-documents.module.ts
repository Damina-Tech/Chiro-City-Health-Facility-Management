import { Module } from '@nestjs/common';
import { StaffDocumentsService } from './staff-documents.service';
import { StaffDocumentsController } from './staff-documents.controller';

@Module({
  controllers: [StaffDocumentsController],
  providers: [StaffDocumentsService],
  exports: [StaffDocumentsService],
})
export class StaffDocumentsModule {}
