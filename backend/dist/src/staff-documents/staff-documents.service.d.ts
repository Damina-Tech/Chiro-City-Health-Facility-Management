import { PrismaService } from '../prisma/prisma.service';
export declare class StaffDocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    private ensureDir;
    upload(staffId: string, file: Express.Multer.File, name: string, type: string, uploadedBy?: string): Promise<{
        id: string;
        name: string;
        type: string;
        staffId: string;
        filePath: string;
        mimeType: string;
        sizeBytes: number | null;
        uploadedAt: Date;
        uploadedBy: string | null;
    }>;
    findByStaff(staffId: string): Promise<{
        id: string;
        name: string;
        type: string;
        staffId: string;
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
