import { FacilityDocumentsService } from './facility-documents.service';
export declare class FacilityDocumentsController {
    private service;
    constructor(service: FacilityDocumentsService);
    upload(facilityId: string, file: Express.Multer.File, name?: string, type?: string): Promise<{
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
