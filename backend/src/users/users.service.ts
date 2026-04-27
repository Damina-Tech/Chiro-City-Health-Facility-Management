import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { ALL_PERMISSIONS } from '../common/constants';

function sanitizeUser(u: { password: string } & Record<string, unknown>) {
  const { password: _p, ...rest } = u;
  return rest;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { role: { include: { permissions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => sanitizeUser(u as any));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: { include: { permissions: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return sanitizeUser(user as any);
  }

  async create(dto: CreateUserDto) {
    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) throw new BadRequestException('Invalid role');
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        roleId: dto.roleId,
      },
      include: { role: { include: { permissions: true } } },
    });
    return sanitizeUser(user as any);
  }

  async update(id: string, dto: UpdateUserDto, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
      if (!role) throw new BadRequestException('Invalid role');
    }
    if (dto.email && dto.email !== user.email) {
      const taken = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (taken) throw new ConflictException('Email already registered');
    }
    const data: any = {};
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.roleId !== undefined) data.roleId = dto.roleId;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: { include: { permissions: true } } },
    });
    return sanitizeUser(updated as any);
  }

  async remove(id: string, currentUserId?: string) {
    if (currentUserId && id === currentUserId) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  async listRoles() {
    return this.prisma.role.findMany({
      include: { permissions: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  async listPermissions() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }

  async updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');
    const allowed = new Set(ALL_PERMISSIONS as readonly string[]);
    const invalid = dto.permissionNames.filter((n) => !allowed.has(n));
    if (invalid.length) {
      throw new BadRequestException(`Unknown permissions: ${invalid.join(', ')}`);
    }
    const perms = await this.prisma.permission.findMany({
      where: { name: { in: dto.permissionNames } },
    });
    if (perms.length !== dto.permissionNames.length) {
      throw new BadRequestException('Some permission names were not found in the database');
    }
    await this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: { set: [], connect: perms.map((p) => ({ id: p.id })) },
      },
      include: { permissions: true },
    });
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { orderBy: { name: 'asc' } } },
    });
  }
}
