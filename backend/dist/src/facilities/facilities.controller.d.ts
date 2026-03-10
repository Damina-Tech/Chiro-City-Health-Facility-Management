import { JwtPayload } from '../common/decorators/current-user.decorator';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
export declare class FacilitiesController {
    private facilitiesService;
    constructor(facilitiesService: FacilitiesService);
    create(dto: CreateFacilityDto, user: JwtPayload): Promise<{
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
    }>;
    findAll(search?: string, status?: string, type?: string): Promise<({
        _count: {
            documents: number;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        staffList: ({
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
        })[];
        services: any;
        legalInfo: any;
        staff: ({
            staff: {
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
            };
        } & {
            id: string;
            department: string | null;
            facilityId: string;
            staffId: string;
            assignedAt: Date;
            assignedBy: string | null;
        })[];
        documents: {
            id: string;
            name: string;
            type: string;
            facilityId: string;
            filePath: string;
            mimeType: string;
            sizeBytes: number | null;
            uploadedAt: Date;
            uploadedBy: string | null;
        }[];
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
    }>;
    getStaff(id: string): Promise<({
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
    update(id: string, dto: UpdateFacilityDto, user: JwtPayload): Promise<{
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
    }>;
    remove(id: string, user: JwtPayload): Promise<{
        deleted: boolean;
    }>;
}
