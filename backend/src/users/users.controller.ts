import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../common/constants';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('roles')
  @UseGuards(PermissionsGuard)
  /** Anyone with users.read or roles.read can list roles (for assign dropdown or matrix). */
  @RequirePermissions(PERMISSIONS.ROLES_READ, PERMISSIONS.USERS_READ)
  listRoles() {
    return this.usersService.listRoles();
  }

  @Get('permissions')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.ROLES_READ, PERMISSIONS.USERS_READ)
  listPermissions() {
    return this.usersService.listPermissions();
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_READ)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_READ)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_CREATE)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_UPDATE)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: JwtPayload) {
    return this.usersService.update(id, dto, user?.sub);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_DELETE)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.usersService.remove(id, user?.sub);
  }
}

@Controller('roles')
@UseGuards(AuthGuard('jwt'))
export class RolesController {
  constructor(private usersService: UsersService) {}

  @Put(':id/permissions')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.ROLES_UPDATE)
  updatePermissions(@Param('id') id: string, @Body() dto: UpdateRolePermissionsDto) {
    return this.usersService.updateRolePermissions(id, dto);
  }
}
