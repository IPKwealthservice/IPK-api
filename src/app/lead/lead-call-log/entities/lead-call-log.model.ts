import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CallDirection, CallStatus } from '../enums/lead-call-log.enum';

@ObjectType('LeadCallLog')
export class LeadCallLogModel {
    @Field((type) => ID)
    id!: string;

    @Field()
    leadId!: string;

    @Field((type) => CallDirection)
    direction!: CallDirection;

    @Field((type) => CallStatus)
    status!: CallStatus;

    @Field()
    phoneNumber!: string;

    @Field({ nullable: true })
    durationSec?: number;

    @Field()
    occurredAt!: Date;

    @Field({ nullable: true })
    nextFollowUpAt?: Date;

    @Field()
    createdBy!: string;

    @Field()
    createdByRole!: string;
}
