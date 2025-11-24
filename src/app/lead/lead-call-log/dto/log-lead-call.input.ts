import { Field, ID, InputType } from '@nestjs/graphql';
import { CallDirection, CallStatus } from '../enums/lead-call-log.enum'; // adjust path as per your project

@InputType('LeadCallLogInput')
export class LeadCallLogInput {
  @Field(() => ID)
  leadId!: string;

  @Field(() => CallDirection)
  direction!: CallDirection;

  @Field(() => CallStatus)
  status!: CallStatus;

  @Field()
  phoneNumber!: string;

  @Field({ nullable: true })
  durationSec?: number;

  @Field({ nullable: true })
  nextFollowUpAt?: Date;

  // createdBy & role will come from context/user session
}
