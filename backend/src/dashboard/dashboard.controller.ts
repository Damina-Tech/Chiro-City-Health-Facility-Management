import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  async getStats() {
    const [totalFacilities, totalStaff, activeFacilities, licenseExpiringCount] =
      await Promise.all([
        this.prisma.facility.count(),
        this.prisma.staff.count(),
        this.prisma.facility.count({ where: { status: 'ACTIVE' } }),
        this.prisma.staff.count({
          where: {
            status: 'ACTIVE',
            licenseExpiry: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    return {
      totalFacilities,
      totalStaff,
      activeFacilities,
      licenseExpiringCount,
    };
  }
}
