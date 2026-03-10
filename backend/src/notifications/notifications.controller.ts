import { Controller, Get, Query, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../common/constants';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.NOTIFICATIONS_READ)
  findAll(@Query('type') type?: string, @Query('limit') limit?: string) {
    return this.notificationsService.findAll({
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Put(':id/read')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.NOTIFICATIONS_MARK_READ)
  markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }
}
