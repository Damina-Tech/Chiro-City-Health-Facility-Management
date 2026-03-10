import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
export declare class StaffService {
    private prisma;
    private audit;
    private notifications;
    constructor(prisma: PrismaService, audit: AuditService, notifications: NotificationsService);
    create(dto: CreateStaffDto, userId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        licenseNo: string | null;
        licenseExpiry: Date | null;
        address: string | null;
        phone: string | null;
        status: string;
        employeeId: string;
        department: string | null;
        designation: string;
        departmentName: string | null;
        joiningDate: Date | null;
        emergencyContact: string | null;
        facilityId: string | null;
    }>;
    findAll(params?: {
        search?: string;
        status?: string;
        facilityId?: string;
    }): Promise<({
        facility: {
            id: string;
            name: string;
            type: string;
        } | null;
        _count: {
            documents: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        licenseNo: string | null;
        licenseExpiry: Date | null;
        address: string | null;
        phone: string | null;
        status: string;
        employeeId: string;
        department: string | null;
        designation: string;
        departmentName: string | null;
        joiningDate: Date | null;
        emergencyContact: string | null;
        facilityId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        documents: {
            id: string;
            name: string;
            type: string;
            staffId: string;
            filePath: string;
            mimeType: string;
            sizeBytes: number | null;
            uploadedAt: Date;
            uploadedBy: string | null;
        }[];
        facility: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            type: string;
            registrationNo: string | null;
            licenseNo: string | null;
            licenseExpiry: Date | null;
            address: string | null;
            phone: string | null;
            status: string;
            services: string | null;
            legalInfo: string | null;
        } | null;
        assignments: ({
            facility: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                type: string;
                registrationNo: string | null;
                licenseNo: string | null;
                licenseExpiry: Date | null;
                address: string | null;
                phone: string | null;
                status: string;
                services: string | null;
                legalInfo: string | null;
            };
        } & {
            id: string;
            department: string | null;
            facilityId: string;
            staffId: string;
            assignedAt: Date;
            assignedBy: string | null;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        licenseNo: string | null;
        licenseExpiry: Date | null;
        address: string | null;
        phone: string | null;
        status: string;
        employeeId: string;
        department: string | null;
        designation: string;
        departmentName: string | null;
        joiningDate: Date | null;
        emergencyContact: string | null;
        facilityId: string | null;
    }>;
    update(id: string, dto: UpdateStaffDto, userId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        licenseNo: string | null;
        licenseExpiry: Date | null;
        address: string | null;
        phone: string | null;
        status: string;
        employeeId: string;
        department: string | null;
        designation: string;
        departmentName: string | null;
        joiningDate: Date | null;
        emergencyContact: string | null;
        facilityId: string | null;
    }>;
    remove(id: string, userId?: string): Promise<{
        deleted: boolean;
    }>;
    findLicenseExpiringWithin(days: number): Promise<({
        facility: {
            name: string;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        licenseNo: string | null;
        licenseExpiry: Date | null;
        address: string | null;
        phone: string | null;
        status: string;
        employeeId: string;
        department: string | null;
        designation: string;
        departmentName: string | null;
        joiningDate: Date | null;
        emergencyContact: string | null;
        facilityId: string | null;
    })[]>;
}
