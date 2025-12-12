import { Field, ID, InputType } from '@nestjs/graphql';
import { CallDirection, CallFailReason, CallSource, CallStatus } from '../enums/lead-call-log.enum';

@InputType('LeadCallLogInput')
export class LeadCallLogInput {
  @Field(() => ID)
  leadId!: string;

  @Field(() => CallDirection)
  direction!: CallDirection;

  @Field(() => CallStatus)
  status!: CallStatus;

  @Field(() => CallSource, { nullable: true })
  source?: CallSource;

  @Field()
  phoneNumber!: string;

  @Field({ nullable: true })
  durationSec?: number;

  @Field({ nullable: true })
  nextFollowUpAt?: Date;

  @Field(() => CallFailReason, { nullable: true })
  failReason?: CallFailReason;

  // createdBy & role will come from context/user session
}
