import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardController {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        totalFacilities: number;
        totalStaff: number;
        activeFacilities: number;
        licenseExpiringCount: number;
    }>;
}
