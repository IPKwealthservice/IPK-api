import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { UserRoles } from '../../user/enums/user.enums';
import { LeadCallLogInput } from './dto/log-lead-call.input';
import { CallStatus } from './enums/lead-call-log.enum';

type Caller = {
  id: string;
  role?: UserRoles | null;
};

@Injectable()
export class LeadCallLogService {
  constructor(private readonly prisma: PrismaService) {}

  async listByLead(leadId: string, status?: CallStatus, limit = 100) {
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

  async logCall(user: Caller, input: LeadCallLogInput) {
    this.ensureAllowedRole(user.role);

    const call = await this.prisma.leadCallLog.create({
      data: {
        leadId: input.leadId,
        direction: input.direction,
        status: input.status,
        phoneNumber: input.phoneNumber,
        durationSec: input.status === CallStatus.COMPLETED ? input.durationSec ?? null : null,
        nextFollowUpAt: input.nextFollowUpAt ?? null,
        occurredAt: new Date(),
        createdBy: user.id,
        createdByRole: (user.role as UserRoles | undefined) ?? UserRoles.STAFF,
      },
    });

    if (call.status === CallStatus.COMPLETED) {
      // Close any lingering pending/missed entries for the same lead.
      await this.closeOpenCallsForLead(call.leadId, call.id);
    }

    return call;
  }

  async finishCall(
    callLogId: string,
    user: Caller,
    updates: { durationSec?: number; nextFollowUpAt?: Date | null } = {},
  ) {
    this.ensureAllowedRole(user.role);

    const existing = await this.prisma.leadCallLog.findUnique({ where: { id: callLogId } });
    if (!existing) {
      throw new NotFoundException('Call log not found');
    }

    const shouldMarkCompleted =
      existing.status === CallStatus.PENDING || existing.status === CallStatus.MISSED;
    const hasFieldUpdates =
      updates.durationSec !== undefined || updates.nextFollowUpAt !== undefined;

    if (!shouldMarkCompleted && !hasFieldUpdates && existing.status === CallStatus.COMPLETED) {
      await this.closeOpenCallsForLead(existing.leadId, existing.id);
      return existing;
    }

    const data: Prisma.LeadCallLogUpdateInput = {
      status: shouldMarkCompleted ? CallStatus.COMPLETED : existing.status,
    };

    if (updates.durationSec !== undefined) {
      data.durationSec = updates.durationSec;
    }

    if (updates.nextFollowUpAt !== undefined) {
      data.nextFollowUpAt = updates.nextFollowUpAt ?? null;
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

  private ensureAllowedRole(role?: UserRoles | null) {
    if (role === UserRoles.ADMIN || role === UserRoles.RM) return;
    throw new ForbiddenException('Only RM and ADMIN users can log lead calls');
  }

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
