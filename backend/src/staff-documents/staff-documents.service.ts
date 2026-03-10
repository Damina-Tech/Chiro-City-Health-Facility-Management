import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'staff');

@Injectable()
export class StaffDocumentsService {
  constructor(private prisma: PrismaService) {}

  private ensureDir() {
    if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  async upload(
    staffId: string,
    file: Express.Multer.File,
    name: string,
    type: string,
    uploadedBy?: string,
  ) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    this.ensureDir();
    const filename = `${staffId}-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(UPLOAD_DIR, filename);
    const { writeFileSync } = await import('fs');
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

  async findByStaff(staffId: string) {
    return this.prisma.staffDocument.findMany({
      where: { staffId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async remove(id: string) {
    const doc = await this.prisma.staffDocument.findUnique({
      where: { id },
    });
    if (!doc) throw new NotFoundException('Document not found');
    await this.prisma.staffDocument.delete({ where: { id } });
    return { deleted: true };
  }
}
