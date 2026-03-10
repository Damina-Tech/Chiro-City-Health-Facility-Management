import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Controller('staff')
@UseGuards(AuthGuard('jwt'))
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Officer')
  create(@Body() dto: CreateStaffDto, @CurrentUser() user: JwtPayload) {
    return this.staffService.create(dto, user?.sub);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('facilityId') facilityId?: string,
  ) {
    return this.staffService.findAll({ search, status, facilityId });
  }

  @Get('license-expiring')
  findLicenseExpiring(@Query('days') days?: string) {
    return this.staffService.findLicenseExpiringWithin(
      days ? parseInt(days, 10) : 30,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Officer')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.update(id, dto, user?.sub);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.staffService.remove(id, user?.sub);
  }
}
