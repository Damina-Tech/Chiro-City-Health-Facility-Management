import { IsString, IsOptional, IsDateString, IsIn, IsArray } from 'class-validator';
import { FACILITY_TYPES } from '../../common/constants';

export class CreateFacilityDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn([...FACILITY_TYPES])
  type: string;

  @IsOptional()
  @IsString()
  registrationNo?: string;

  @IsOptional()
  @IsString()
  licenseNo?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  services?: string[]; // will be stored as JSON

  @IsOptional()
  legalInfo?: Record<string, unknown>;
}
