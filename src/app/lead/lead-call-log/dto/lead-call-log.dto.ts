import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CallDirection, CallFailReason, CallSource, CallStatus } from '../enums/lead-call-log.enum';

export class CreateLeadCallLogDto {
  @IsString()
  @IsNotEmpty()
  leadId!: string;

  @IsEnum(CallDirection)
  direction!: CallDirection;

  @IsEnum(CallStatus)
  status!: CallStatus;

  @IsOptional()
  @IsEnum(CallSource)
  source?: CallSource;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phoneNumber!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextFollowUpAt?: Date;

  @IsOptional()
  @IsEnum(CallFailReason)
  failReason?: CallFailReason;
}

export class UpdateLeadCallStatusDto {
  @IsEnum(CallStatus)
  status!: CallStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextFollowUpAt?: Date | null;

  @IsOptional()
  @IsEnum(CallFailReason)
  failReason?: CallFailReason | null;
}
