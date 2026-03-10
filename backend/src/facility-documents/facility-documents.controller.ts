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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FacilityDocumentsService } from './facility-documents.service';

@Controller('documents/facility')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Admin', 'Officer')
export class FacilityDocumentsController {
  constructor(private service: FacilityDocumentsService) {}

  @Post(':facilityId')
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
  findByFacility(@Param('facilityId') facilityId: string) {
    return this.service.findByFacility(facilityId);
  }

  @Delete('doc/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
