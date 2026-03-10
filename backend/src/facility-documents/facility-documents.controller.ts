import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../common/constants';
import { FacilityDocumentsService } from './facility-documents.service';

@Controller('documents/facility')
@UseGuards(AuthGuard('jwt'))
export class FacilityDocumentsController {
  constructor(private service: FacilityDocumentsService) {}

  @Post(':facilityId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DOCUMENTS_FACILITY_UPLOAD)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('facilityId') facilityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name?: string,
    @Body('type') type?: string,
  ) {
    if (!file) throw new Error('File is required');
    return this.service.upload(facilityId, file, name || file.originalname, type || 'other');
  }

  @Get(':facilityId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DOCUMENTS_FACILITY_READ)
  findByFacility(@Param('facilityId') facilityId: string) {
    return this.service.findByFacility(facilityId);
  }

  @Delete('doc/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DOCUMENTS_FACILITY_DELETE)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
