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
exports.StaffDocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const path_1 = require("path");
const fs_1 = require("fs");
const UPLOAD_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'staff');
let StaffDocumentsService = class StaffDocumentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    ensureDir() {
        if (!(0, fs_1.existsSync)(UPLOAD_DIR))
            (0, fs_1.mkdirSync)(UPLOAD_DIR, { recursive: true });
    }
    async upload(staffId, file, name, type, uploadedBy) {
        const staff = await this.prisma.staff.findUnique({
            where: { id: staffId },
        });
        if (!staff)
            throw new common_1.NotFoundException('Staff not found');
        this.ensureDir();
        const filename = `${staffId}-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = (0, path_1.join)(UPLOAD_DIR, filename);
        const { writeFileSync } = await Promise.resolve().then(() => require('fs'));
        writeFileSync(filePath, file.buffer);
        const relativePath = `staff/${filename}`;
        return this.prisma.staffDocument.create({
            data: {
                staffId,
                name: name || file.originalname,
                type: type || 'other',
                filePath: relativePath,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                uploadedBy,
            },
        });
    }
    async findByStaff(staffId) {
        return this.prisma.staffDocument.findMany({
            where: { staffId },
            orderBy: { uploadedAt: 'desc' },
        });
    }
    async remove(id) {
        const doc = await this.prisma.staffDocument.findUnique({
            where: { id },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        await this.prisma.staffDocument.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.StaffDocumentsService = StaffDocumentsService;
exports.StaffDocumentsService = StaffDocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffDocumentsService);
//# sourceMappingURL=staff-documents.service.js.map