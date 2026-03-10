import { Module } from '@nestjs/common';
import { FacilityDocumentsService } from './facility-documents.service';
import { FacilityDocumentsController } from './facility-documents.controller';

@Module({
  controllers: [FacilityDocumentsController],
  providers: [FacilityDocumentsService],
  exports: [FacilityDocumentsService],
})
export class FacilityDocumentsModule {}
