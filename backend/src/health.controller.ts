import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      message: 'Server is running fine',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      message: 'Server is running fine',
      timestamp: new Date().toISOString(),
    };
  }
}
