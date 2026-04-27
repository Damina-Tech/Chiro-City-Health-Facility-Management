import {
  IsString,
  IsOptional,
  IsDateString,
  IsIn,
  IsNumber,
  IsObject,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FACILITY_TYPES, OWNERSHIP_TYPES } from '../../common/constants';

// Facility-type-specific DTOs (validated when type matches)
export class HospitalSpecificDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  numberOfBeds?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  icuAvailability?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  emergencyService?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  numberOfDepartments?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  ambulanceService?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  surgeryService?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  laboratoryAvailable?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  bloodBankAvailable?: boolean;
}

export class ClinicSpecificDto {
  @IsOptional()
  @IsString()
  clinicCategory?: string; // GENERAL | SPECIALIZED

  @IsOptional()
  @IsString()
  specialization?: string; // DENTAL | EYE | PEDIATRICS | DERMATOLOGY etc

  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationRoomsCount?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  laboratoryAvailable?: boolean;
}

export class HealthCenterSpecificDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  catchmentPopulation?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  maternalCareAvailable?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  vaccinationService?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  communityHealthProgram?: boolean;
}

export class PharmacySpecificDto {
  @IsOptional()
  @IsString()
  pharmacyType?: string; // RETAIL | WHOLESALE | HOSPITAL_PHARMACY

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  drugStorageFacility?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  coldStorageAvailable?: boolean;

  @IsOptional()
  @IsString()
  controlledDrugAuthorizationNumber?: string;

  @IsOptional()
  @IsString()
  pharmacistInChargeId?: string; // Staff reference
}

// Union for specific fields (one of these per facility type)
export interface FacilitySpecificFieldsDto {
  hospital?: HospitalSpecificDto;
  clinic?: ClinicSpecificDto;
  healthCenter?: HealthCenterSpecificDto;
  pharmacy?: PharmacySpecificDto;
}

export class CreateFacilityDto {
  // --- Basic Information ---
  @IsString()
  name: string;

  @IsString()
  @IsIn([...FACILITY_TYPES])
  type: string;

  @IsOptional()
  @IsString()
  @IsIn([...OWNERSHIP_TYPES])
  ownershipType?: string;

  @IsOptional()
  @IsString()
  registrationNo?: string;

  @IsOptional()
  @IsString()
  tin?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // --- Location ---
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  woreda?: string;

  @IsOptional()
  @IsString()
  kebele?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  gpsLat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  gpsLng?: number;

  // --- Contact ---
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  altPhone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  // --- Legal & Compliance ---
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
  regulatoryAuthority?: string;

  @IsOptional()
  @IsString()
  accreditationLevel?: string;

  // --- Operational ---
  @IsOptional()
  @IsString()
  operatingHours?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  approvalStatus?: string;

  // --- Legacy ---
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  services?: string[];

  @IsOptional()
  legalInfo?: Record<string, unknown>;

  // --- Facility-type-specific (sent as object, stored as JSON) ---
  @IsOptional()
  @IsObject()
  specificFields?: FacilitySpecificFieldsDto;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
