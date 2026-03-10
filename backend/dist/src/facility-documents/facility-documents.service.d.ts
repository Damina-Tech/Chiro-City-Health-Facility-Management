import { PrismaService } from '../prisma/prisma.service';
export declare class FacilityDocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    private ensureDir;
    upload(facilityId: string, file: Express.Multer.File, name: string, type: string, uploadedBy?: string): Promise<{
        id: string;
        name: string;
        type: string;
        facilityId: string;
        filePath: string;
        mimeType: string;
        sizeBytes: number | null;
        uploadedAt: Date;
        uploadedBy: string | null;
    }>;
    findByFacility(facilityId: string): Promise<{
        id: string;
        name: string;
        type: string;
        facilityId: string;
        filePath: string;
        mimeType: string;
        sizeBytes: number | null;
        uploadedAt: Date;
        uploadedBy: string | null;
    }[]>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
