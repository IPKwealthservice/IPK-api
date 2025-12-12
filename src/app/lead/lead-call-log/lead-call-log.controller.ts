import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/current-user.decorator';
import { FirebaseAuthGuard } from '../../core/firebase/firebase-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateLeadCallLogDto, UpdateLeadCallStatusDto } from './dto/lead-call-log.dto';
import { CallStatus } from './enums/lead-call-log.enum';
import { LeadCallLogService } from './lead-call-log.service';

@UseGuards(FirebaseAuthGuard)
@Controller('lead-call-logs')
export class LeadCallLogController {
  constructor(private readonly service: LeadCallLogService) {}

  @Get()
  listByLead(
    @Query('leadId') leadId: string,
    @Query('status', new ParseEnumPipe(CallStatus, { optional: true })) status?: CallStatus,
    @Query('limit') limit = '100',
  ) {
    if (!leadId) {
      throw new BadRequestException('leadId is required');
    }
    return this.service.listByLead(leadId, status, this.parseLimit(limit));
  }

  @Get('pending')
  pendingCalls(
    @CurrentUser() user: UserEntity,
    @Query('leadId') leadId?: string,
    @Query('includeMissed') includeMissed?: string,
    @Query('limit') limit = '100',
    @Query('createdBy') createdBy?: string,
  ) {
    const includeMissedCalls = this.parseBoolean(includeMissed ?? 'true');
    const query = {
      leadId: leadId ?? undefined,
      createdBy: createdBy ?? user?.id ?? undefined,
      limit: this.parseLimit(limit),
    };

    if (!includeMissedCalls) {
      return this.service.getPending(query);
    }

    return this.service.listPendingCalls({
      ...query,
      includeMissed: includeMissedCalls,
    });
  }

  @Get('missed')
  missedCalls(
    @CurrentUser() user: UserEntity,
    @Query('leadId') leadId?: string,
    @Query('limit') limit = '100',
    @Query('createdBy') createdBy?: string,
  ) {
    return this.service.getMissed({
      leadId: leadId ?? undefined,
      createdBy: createdBy ?? user?.id ?? undefined,
      limit: this.parseLimit(limit),
    });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  recordCall(@CurrentUser() user: UserEntity, @Body() input: CreateLeadCallLogDto) {
    const nextFollowUpAt = this.coerceDate(input.nextFollowUpAt);
    return this.service.logCall(user, {
      leadId: input.leadId,
      direction: input.direction,
      status: input.status,
      source: input.source,
      phoneNumber: input.phoneNumber,
      durationSec: input.durationSec,
      nextFollowUpAt: nextFollowUpAt ?? undefined,
      failReason: input.failReason,
    });
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
    @Body() input: UpdateLeadCallStatusDto,
  ) {
    if (input.status === CallStatus.MISSED) {
      return this.service.markMissed(id, user, {
        nextFollowUpAt: this.coerceDate(input.nextFollowUpAt),
        failReason: input.failReason ?? undefined,
      });
    }

    return this.service.finishCall(id, user, {
      durationSec: input.durationSec,
      nextFollowUpAt: this.coerceDate(input.nextFollowUpAt),
    });
  }

  private parseLimit(raw: string | number | undefined, defaultValue = 100) {
    if (typeof raw === 'number') return raw;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return defaultValue;
  }

  private parseBoolean(raw?: string) {
    if (raw === undefined || raw === null) return false;
    return raw === 'true' || raw === '1';
  }

  private coerceDate(value?: Date | string | null) {
    if (value === null) return null;
    if (value === undefined) return undefined;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
}
