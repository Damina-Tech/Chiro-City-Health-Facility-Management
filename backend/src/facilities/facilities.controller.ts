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
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@Controller('facilities')
@UseGuards(AuthGuard('jwt'))
export class FacilitiesController {
  constructor(private facilitiesService: FacilitiesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Officer')
  create(@Body() dto: CreateFacilityDto, @CurrentUser() user: JwtPayload) {
    return this.facilitiesService.create(dto, user?.sub);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.facilitiesService.findAll({ search, status, type });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(id);
  }

  @Get(':id/staff')
  getStaff(@Param('id') id: string) {
    return this.facilitiesService.getStaff(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Officer')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFacilityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.facilitiesService.update(id, dto, user?.sub);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.facilitiesService.remove(id, user?.sub);
  }
}
