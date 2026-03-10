import { StaffDocumentsService } from './staff-documents.service';
export declare class StaffDocumentsController {
    private service;
    constructor(service: StaffDocumentsService);
    upload(staffId: string, file: Express.Multer.File, name?: string, type?: string): Promise<{
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
