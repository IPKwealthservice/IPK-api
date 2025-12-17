import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../auth/current-user.decorator';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { LeadCallLogInput } from './dto/log-lead-call.input';
import { LeadCallLogModel } from './entities/lead-call-log.model';
import { MissedLeadCallSummary } from './entities/missed-lead-call-summary.model';
import { CallFailReason, CallStatus } from './enums/lead-call-log.enum';
import { LeadCallLogService } from './lead-call-log.service';

@Resolver(() => LeadCallLogModel)
export class LeadCallLogResolver {
  constructor(private readonly service: LeadCallLogService) { }

  @UseGuards(GqlAuthGuard)
  @Query(() => [LeadCallLogModel], { name: 'leadCallLogs' })
  leadCallLogs(
    @Args('leadId', { type: () => ID }) leadId: string,
    @Args('status', { type: () => CallStatus, nullable: true })
    status?: CallStatus,
    @Args('limit', { type: () => Int, nullable: true }) limit = 100,
  ) {
    return this.service.listByLead(leadId, status, limit);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [LeadCallLogModel], { name: 'pendingLeadCallLogs' })
  pendingLeadCallLogs(
    @CurrentUser() user: UserEntity,
    @Args('leadId', { type: () => ID, nullable: true }) leadId?: string,
    @Args('includeMissed', { type: () => Boolean, nullable: true })
    includeMissed = true,
    @Args('limit', { type: () => Int, nullable: true }) limit = 100,
  ) {
    return this.service.listPendingCalls({
      leadId: leadId ?? undefined,
      createdBy: user.id,
      includeMissed,
      limit,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [LeadCallLogModel], { name: 'pendingLeadCalls' })
  pendingLeadCalls(
    @CurrentUser() user: UserEntity,
    @Args('leadId', { type: () => ID, nullable: true }) leadId?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit = 100,
  ) {
    return this.service.getPending({
      leadId: leadId ?? undefined,
      createdBy: user.id,
      limit,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [LeadCallLogModel], { name: 'missedLeadCalls' })
  missedLeadCalls(
    @CurrentUser() user: UserEntity,
    @Args('leadId', { type: () => ID, nullable: true }) leadId?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit = 100,
  ) {
    return this.service.getMissed({
      leadId: leadId ?? undefined,
      createdBy: user.id,
      limit,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => MissedLeadCallSummary, { name: 'missedLeadCallsSummary' })
  missedLeadCallsSummary(
    @CurrentUser() user: UserEntity,
    @Args('leadId', { type: () => ID, nullable: true }) leadId?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit = 100,
  ) {
    return this.service.getMissedWithCount({
      leadId: leadId ?? undefined,
      createdBy: user.id,
      limit,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LeadCallLogModel, { name: 'recordLeadCall' })
  recordLeadCall(@CurrentUser() user: UserEntity, @Args('input') input: LeadCallLogInput) {
    return this.service.logCall(user, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LeadCallLogModel, { name: 'finishLeadCall' })
  finishLeadCall(
    @Args('callLogId', { type: () => ID }) callLogId: string,
    @CurrentUser() user: UserEntity,
    @Args('durationSec', { type: () => Int, nullable: true }) durationSec?: number,
    @Args('nextFollowUpAt', { nullable: true }) nextFollowUpAt?: Date,
  ) {
    return this.service.finishCall(callLogId, user, { durationSec, nextFollowUpAt });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => LeadCallLogModel, { name: 'markLeadCallMissed' })
  markLeadCallMissed(
    @Args('callLogId', { type: () => ID }) callLogId: string,
    @CurrentUser() user: UserEntity,
    @Args('nextFollowUpAt', { nullable: true }) nextFollowUpAt?: Date,
    @Args('failReason', { type: () => CallFailReason, nullable: true }) failReason?: CallFailReason,
  ) {
    return this.service.markMissed(callLogId, user, { nextFollowUpAt, failReason });
  }
}
