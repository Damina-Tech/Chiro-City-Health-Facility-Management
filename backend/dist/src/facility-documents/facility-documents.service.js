"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityDocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const path_1 = require("path");
const fs_1 = require("fs");
const UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'facility');
let FacilityDocumentsService = class FacilityDocumentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    ensureDir() {
        if (!(0, fs_1.existsSync)(UPLOAD_DIR))
            (0, fs_1.mkdirSync)(UPLOAD_DIR, { recursive: true });
    }
    async upload(facilityId, file, name, type, uploadedBy) {
        const facility = await this.prisma.facility.findUnique({
            where: { id: facilityId },
        });
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        this.ensureDir();
        const filename = `${facilityId}-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = (0, path_1.join)(UPLOAD_DIR, filename);
        const { writeFileSync } = await Promise.resolve().then(() => require('fs'));
        writeFileSync(filePath, file.buffer);
        const relativePath = `facility/${filename}`;
        return this.prisma.facilityDocument.create({
            data: {
                facilityId,
                name: name || file.originalname,
                type: type || 'other',
                filePath: relativePath,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                uploadedBy,
            },
        });
    }
    async findByFacility(facilityId) {
        return this.prisma.facilityDocument.findMany({
            where: { facilityId },
            orderBy: { uploadedAt: 'desc' },
        });
    }
    async remove(id) {
        const doc = await this.prisma.facilityDocument.findUnique({
            where: { id },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        await this.prisma.facilityDocument.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.FacilityDocumentsService = FacilityDocumentsService;
exports.FacilityDocumentsService = FacilityDocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FacilityDocumentsService);
//# sourceMappingURL=facility-documents.service.js.map