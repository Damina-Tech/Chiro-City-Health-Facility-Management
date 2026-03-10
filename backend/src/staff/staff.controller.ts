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
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../common/constants';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Controller('staff')
@UseGuards(AuthGuard('jwt'))
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.STAFF_CREATE)
  create(@Body() dto: CreateStaffDto, @CurrentUser() user: JwtPayload) {
    return this.staffService.create(dto, user?.sub);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.STAFF_READ)
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('facilityId') facilityId?: string,
  ) {
    return this.staffService.findAll({ search, status, facilityId });
  }

  @Get('license-expiring')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.STAFF_READ)
  findLicenseExpiring(@Query('days') days?: string) {
    return this.staffService.findLicenseExpiringWithin(
      days ? parseInt(days, 10) : 30,
    );
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.STAFF_READ)
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.STAFF_UPDATE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.update(id, dto, user?.sub);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.STAFF_DELETE)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.staffService.remove(id, user?.sub);
  }
}
