import { IsString, IsOptional, IsEmail, IsDateString, IsUUID, IsIn, IsObject } from 'class-validator';
import { STAFF_ROLES, EMPLOYMENT_TYPES, GENDERS } from '../../common/constants';

/** Role-specific payload shape (stored as JSON) */
export interface StaffSpecificFieldsDto {
  doctor?: Record<string, unknown>;
  nurse?: Record<string, unknown>;
  pharmacist?: Record<string, unknown>;
  labTechnician?: Record<string, unknown>;
  administrative?: Record<string, unknown>;
}

export class CreateStaffDto {
  @IsString()
  employeeId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  @IsIn([...GENDERS])
  gender?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsString()
  designation: string;

  @IsOptional()
  @IsString()
  @IsIn([...STAFF_ROLES])
  staffRole?: string;

  @IsOptional()
  @IsString()
  @IsIn([...EMPLOYMENT_TYPES])
  employmentType?: string;

  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @IsOptional()
  @IsString()
  departmentName?: string;

  @IsOptional()
  @IsString()
  licenseNo?: string;

  @IsOptional()
  @IsDateString()
  licenseIssueDate?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsObject()
  specificFields?: StaffSpecificFieldsDto;

  @IsOptional()
  @IsString()
  createdBy?: string;

  /** Legacy full name (optional if firstName + lastName provided) */
  @IsOptional()
  @IsString()
  name?: string;
}
