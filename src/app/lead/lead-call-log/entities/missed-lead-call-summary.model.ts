import { Field, Int, ObjectType } from '@nestjs/graphql';
import { LeadCallLogModel } from './lead-call-log.model';

@ObjectType()
export class MissedLeadCallSummary {
  @Field(() => [LeadCallLogModel])
  calls!: LeadCallLogModel[];

  @Field(() => Int)
  total!: number;
}
