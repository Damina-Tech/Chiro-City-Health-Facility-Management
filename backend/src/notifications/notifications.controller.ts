import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ROLES } from '../common/constants';
import { NotificationsService } from './notifications.service';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findAll({
      user,
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Put(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.markRead(id, user);
  }

  @Delete('clear')
  clear(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.clearAll(user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.removeOne(id, user);
  }

  /** Admin broadcast: in-app and/or email, to all or by role. */
  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles(ROLES.ADMIN)
  broadcast(@Body() dto: BroadcastNotificationDto, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.broadcast(dto, user);
  }
}
