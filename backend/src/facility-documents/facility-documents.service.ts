import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'facility');

@Injectable()
export class FacilityDocumentsService {
  constructor(private prisma: PrismaService) {}

  private ensureDir() {
    if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  async upload(
    facilityId: string,
    file: Express.Multer.File,
    name: string,
    type: string,
    uploadedBy?: string,
  ) {
    const facility = await this.prisma.facility.findUnique({
      where: { id: facilityId },
    });
    if (!facility) throw new NotFoundException('Facility not found');

    this.ensureDir();
    const filename = `${facilityId}-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(UPLOAD_DIR, filename);
    const { writeFileSync } = await import('fs');
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

  async findByFacility(facilityId: string) {
    return this.prisma.facilityDocument.findMany({
      where: { facilityId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async remove(id: string) {
    const doc = await this.prisma.facilityDocument.findUnique({
      where: { id },
    });
    if (!doc) throw new NotFoundException('Document not found');
    await this.prisma.facilityDocument.delete({ where: { id } });
    return { deleted: true };
  }
}
