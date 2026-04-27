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
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@Controller('facilities')
@UseGuards(AuthGuard('jwt'))
export class FacilitiesController {
  constructor(private facilitiesService: FacilitiesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.FACILITIES_CREATE)
  create(@Body() dto: CreateFacilityDto, @CurrentUser() user: JwtPayload) {
    return this.facilitiesService.create(dto, user?.sub, user?.role);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.FACILITIES_READ)
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.facilitiesService.findAll({ search, status, type });
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.FACILITIES_READ)
  findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(id);
  }

  @Get(':id/staff')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.FACILITIES_READ)
  getStaff(@Param('id') id: string) {
    return this.facilitiesService.getStaff(id);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.FACILITIES_UPDATE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFacilityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.facilitiesService.update(id, dto, user?.sub, user?.role);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.FACILITIES_DELETE)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.facilitiesService.remove(id, user?.sub);
  }
}
