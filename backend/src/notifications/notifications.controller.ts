import { Controller, Get, Query, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query('type') type?: string, @Query('limit') limit?: string) {
    return this.notificationsService.findAll({
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Put(':id/read')
  markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }
}
