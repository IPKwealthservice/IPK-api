import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PhoneLabel } from '../../enums/ipk-leadd.enum';

export class ClientQaUpdateDto {
  @IsString()
  @MaxLength(256)
  question!: string;

  @IsString()
  @MaxLength(256)
  answer!: string;
}

export class OccupationUpdateDto {
  @IsString()
  @MaxLength(64)
  profession!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  designation?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string;
}

export class LeadPhoneUpdateDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsEnum(PhoneLabel)
  label?: PhoneLabel;

  @IsString()
  @IsNotEmpty()
  number!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isWhatsapp?: boolean;
}

export class UpdateLeadDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LeadPhoneUpdateDto)
  phones?: LeadPhoneUpdateDto[];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(128)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  leadSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  referralCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  referralName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  gender?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  product?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  investmentRange?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sipAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  clientTypes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  remark?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  bioText?: string;

  @IsOptional()
  @IsDateString()
  nextActionDueAt?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientQaUpdateDto)
  clientQa?: ClientQaUpdateDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OccupationUpdateDto)
  occupations?: OccupationUpdateDto[];

  @IsOptional()
  @IsString()
  @MaxLength(32)
  stageFilter?: string;
}
