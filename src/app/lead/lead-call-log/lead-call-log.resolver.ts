import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../auth/current-user.decorator';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { UserEntity } from '../../user/entities/user.entity';
import { LeadCallLogInput } from './dto/log-lead-call.input';
import { LeadCallLogModel } from './entities/lead-call-log.model';
import { CallStatus } from './enums/lead-call-log.enum';
import { LeadCallLogService } from './lead-call-log.service';

@Resolver(() => LeadCallLogModel)
export class LeadCallLogResolver {
  constructor(private readonly service: LeadCallLogService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [LeadCallLogModel], { name: 'leadCallLogs' })
  leadCallLogs(
    @Args('leadId', { type: () => ID }) leadId: string,
    @Args('status', { type: () => CallStatus, nullable: true }) status?: CallStatus,
    @Args('limit', { type: () => Int, nullable: true }) limit = 100,
  ) {
    return this.service.listByLead(leadId, status, limit);
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
}
