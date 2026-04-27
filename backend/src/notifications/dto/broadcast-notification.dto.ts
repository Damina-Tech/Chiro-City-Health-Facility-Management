import { IsBoolean, IsIn, IsOptional, IsString, ValidateIf } from 'class-validator';

export class BroadcastNotificationDto {
  @IsString()
  title!: string;

  @IsString()
  message!: string;

  /** Arbitrary type string (e.g. ANNOUNCEMENT) */
  @IsOptional()
  @IsString()
  type?: string;

  /** Who should receive it */
  @IsIn(['ALL', 'ROLE'])
  audience!: 'ALL' | 'ROLE';

  /** Required when audience=ROLE (e.g. Officer, Admin, DOCTOR, STAFF) */
  @ValidateIf((v) => v.audience === 'ROLE')
  @IsString()
  role!: string;

  /** Delivery channels */
  @IsBoolean()
  inApp!: boolean;

  @IsBoolean()
  email!: boolean;
}

