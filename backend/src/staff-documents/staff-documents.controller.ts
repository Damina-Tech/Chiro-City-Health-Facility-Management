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
import { StaffDocumentsService } from './staff-documents.service';

@Controller('documents/staff')
@UseGuards(AuthGuard('jwt'))
export class StaffDocumentsController {
  constructor(private service: StaffDocumentsService) {}

  @Post(':staffId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DOCUMENTS_STAFF_UPLOAD)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('staffId') staffId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name?: string,
    @Body('type') type?: string,
  ) {
    if (!file) throw new Error('File is required');
    return this.service.upload(staffId, file, name || file.originalname, type || 'other');
  }

  @Get(':staffId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DOCUMENTS_STAFF_READ)
  findByStaff(@Param('staffId') staffId: string) {
    return this.service.findByStaff(staffId);
  }

  @Delete('doc/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DOCUMENTS_STAFF_DELETE)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
