import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, LeadCallLog as PrismaLeadCallLog } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { UserRoles } from '../../user/enums/user.enums';
import { LeadCallLogInput } from './dto/log-lead-call.input';
import { CallDirection, CallFailReason, CallSource, CallStatus } from './enums/lead-call-log.enum';

type Caller = {
  id: string;
  role?: UserRoles | null;
  name?: string | null;
};

type MissedCallsResult = {
  calls: PrismaLeadCallLog[];
  total: number;
};

@Injectable()
export class LeadCallLogService {
  constructor(private readonly prisma: PrismaService) { }

  /** List all call-logs for a lead, optionally filtered by status */
  async listByLead(leadId: string, status?: CallStatus, limit = 100): Promise<PrismaLeadCallLog[]> {
    const where: Prisma.LeadCallLogWhereInput = {
      leadId,
      ...(status ? { status } : {}),
    };

    return this.prisma.leadCallLog.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });
  }

  /** List pending (or optionally missed) for user or lead → good for follow-ups list */
  async listPendingCalls(params: {
    leadId?: string;
    createdBy?: string;
    includeMissed?: boolean;
    limit?: number;
  }): Promise<PrismaLeadCallLog[]> {
    const { leadId, createdBy, includeMissed = true, limit = 100 } = params;
    const statuses = includeMissed ? [CallStatus.PENDING, CallStatus.MISSED] : [CallStatus.PENDING];

    const where: Prisma.LeadCallLogWhereInput = {
      status: { in: statuses },
      ...(leadId ? { leadId } : {}),
      ...(createdBy ? { createdBy } : {}),
    };

    // If only pending (so follow-ups scheduled), order by nextFollowUpAt ascending
    // else (pending + missed) order by occurredAt descending
    const orderBy =
      statuses.length === 1
        ? { nextFollowUpAt: Prisma.SortOrder.asc }
        : { occurredAt: Prisma.SortOrder.desc };

    return this.prisma.leadCallLog.findMany({
      where,
      orderBy,
      take: limit,
    });
  }

  /** Only pending follow-ups (sorted by nextFollowUpAt) */
  async getPending(
    params: {
      leadId?: string;
      createdBy?: string;
      limit?: number;
    } = {},
  ): Promise<PrismaLeadCallLog[]> {
    const { leadId, createdBy, limit = 100 } = params;
    const where: Prisma.LeadCallLogWhereInput = {
      status: CallStatus.PENDING,
      ...(leadId ? { leadId } : {}),
      ...(createdBy ? { createdBy } : {}),
    };

    return this.prisma.leadCallLog.findMany({
      where,
      orderBy: { nextFollowUpAt: 'asc' },
      take: limit,
    });
  }

  /** Only missed calls (sorted by recent first) */
  async getMissed(
    params: {
      leadId?: string;
      createdBy?: string;
      limit?: number;
    } = {},
  ): Promise<PrismaLeadCallLog[]> {
    const { leadId, createdBy, limit = 100 } = params;
    const where: Prisma.LeadCallLogWhereInput = {
      status: CallStatus.MISSED,
      ...(leadId ? { leadId } : {}),
      ...(createdBy ? { createdBy } : {}),
    };

    return this.prisma.leadCallLog.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });
  }

  /** Missed calls list + total count (for UI summaries) */
  async getMissedWithCount(
    params: {
      leadId?: string;
      createdBy?: string;
      limit?: number;
    } = {},
  ): Promise<MissedCallsResult> {
    const { leadId, createdBy, limit = 100 } = params;
    const where: Prisma.LeadCallLogWhereInput = {
      status: CallStatus.MISSED,
      ...(leadId ? { leadId } : {}),
      ...(createdBy ? { createdBy } : {}),
    };

    const [calls, total] = await this.prisma.$transaction([
      this.prisma.leadCallLog.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        take: limit,
      }),
      this.prisma.leadCallLog.count({ where }),
    ]);

    return { calls, total };
  }

  /** Fetch a single call log by ID or throw */
  async getById(callLogId: string): Promise<PrismaLeadCallLog> {
    const call = await this.prisma.leadCallLog.findUnique({
      where: { id: callLogId },
    });
    if (!call) {
      throw new NotFoundException('Call log not found');
    }
    return call;
  }

  /** Create a PENDING call log (e.g. scheduled call or manual entry) */
  async createPendingCall(user: Caller, input: LeadCallLogInput): Promise<PrismaLeadCallLog> {
    this.ensureAllowedRole(user.role);

    return this.prisma.leadCallLog.create({
      data: {
        leadId: input.leadId,
        direction: input.direction ?? CallDirection.OUTGOING,
        source: this.resolveSource(input.direction, input.source),
        status: CallStatus.PENDING,
        phoneNumber: input.phoneNumber,
        failReason: input.failReason ?? null,
        nextFollowUpAt: input.nextFollowUpAt ?? null,
        occurredAt: new Date(),
        createdBy: user.id,
        createdByName: user.name ?? 'Unknown',
      },
    });
  }

  /** General call logger: pending / missed / completed based on input.status */
  async logCall(user: Caller, input: LeadCallLogInput): Promise<PrismaLeadCallLog> {
    this.ensureAllowedRole(user.role);

    if (input.status === CallStatus.PENDING) {
      return this.createPendingCall(user, input);
    }

    const call = await this.prisma.leadCallLog.create({
      data: {
        leadId: input.leadId,
        direction: input.direction ?? CallDirection.OUTGOING,
        source: this.resolveSource(input.direction, input.source),
        status: input.status,
        phoneNumber: input.phoneNumber,
        failReason: input.failReason ?? null,
        durationSec: input.status === CallStatus.COMPLETED ? (input.durationSec ?? null) : null,
        nextFollowUpAt: input.nextFollowUpAt ?? null,
        occurredAt: new Date(),
        createdBy: user.id,
        createdByName: user.name ?? 'Unknown',
      },
    });

    if (call.status === CallStatus.COMPLETED) {
      await this.closeOpenCallsForLead(call.leadId, call.id);
    }

    return call;
  }

  /** Mark an existing call log as completed (e.g. after call ends) */
  async finishCall(
    callLogId: string,
    user: Caller,
    updates: { durationSec?: number; nextFollowUpAt?: Date | null } = {},
  ): Promise<PrismaLeadCallLog> {
    this.ensureAllowedRole(user.role);

    const existing = await this.getById(callLogId);

    const shouldMarkCompleted =
      existing.status === CallStatus.PENDING || existing.status === CallStatus.MISSED;

    const data: Prisma.LeadCallLogUpdateInput = {
      status: shouldMarkCompleted ? CallStatus.COMPLETED : existing.status,
      failReason: shouldMarkCompleted ? null : existing.failReason,
    };

    if (updates.durationSec !== undefined) {
      data.durationSec = updates.durationSec;
    }

    if (updates.nextFollowUpAt !== undefined) {
      data.nextFollowUpAt = updates.nextFollowUpAt;
    }

    const updated = await this.prisma.leadCallLog.update({
      where: { id: callLogId },
      data,
    });

    if (updated.status === CallStatus.COMPLETED) {
      await this.closeOpenCallsForLead(updated.leadId, updated.id);
    }

    return updated;
  }

  /** Mark call log as missed (e.g. lead called but no answer / RM missed call) */
  async markMissed(
    callLogId: string,
    user: Caller,
    updates: { nextFollowUpAt?: Date | null; failReason?: CallFailReason | null } = {},
  ): Promise<PrismaLeadCallLog> {
    this.ensureAllowedRole(user.role);

    const existing = await this.getById(callLogId);

    const data: Prisma.LeadCallLogUpdateInput = {
      status: CallStatus.MISSED,
      failReason: updates.failReason ?? existing.failReason ?? CallFailReason.NO_ANSWER,
    };

    if (updates.nextFollowUpAt !== undefined) {
      data.nextFollowUpAt = updates.nextFollowUpAt;
    }

    return this.prisma.leadCallLog.update({
      where: { id: callLogId },
      data,
    });
  }

  private ensureAllowedRole(role?: UserRoles | null) {
    if (role === UserRoles.ADMIN || role === UserRoles.RM) return;
    throw new ForbiddenException('Only RM and ADMIN users can log lead calls');
  }

  private resolveSource(direction?: CallDirection | null, source?: CallSource | null): CallSource {
    if (source) return source;
    return direction === CallDirection.INCOMING ? CallSource.INCOMING : CallSource.SYSTEM;
  }

  /** After one call completes, mark all other PENDING/MISSED calls for that lead as COMPLETED (clean up) */
  private async closeOpenCallsForLead(leadId: string, excludeId?: string) {
    const where: Prisma.LeadCallLogWhereInput = {
      leadId,
      status: { in: [CallStatus.PENDING, CallStatus.MISSED] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    };

    await this.prisma.leadCallLog.updateMany({
      where,
      data: { status: CallStatus.COMPLETED },
    });
  }
}
