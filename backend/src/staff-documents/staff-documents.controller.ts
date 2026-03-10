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
import { StaffDocumentsService } from './staff-documents.service';

@Controller('documents/staff')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Admin', 'Officer')
export class StaffDocumentsController {
  constructor(private service: StaffDocumentsService) {}

  @Post(':staffId')
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
  findByStaff(@Param('staffId') staffId: string) {
    return this.service.findByStaff(staffId);
  }

  @Delete('doc/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
