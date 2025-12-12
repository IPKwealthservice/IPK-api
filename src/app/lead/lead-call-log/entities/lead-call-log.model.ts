import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CallDirection, CallFailReason, CallSource, CallStatus } from '../enums/lead-call-log.enum';

@ObjectType('LeadCallLog')
export class LeadCallLogModel {
    @Field((type) => ID)
    id!: string;

    @Field()
    leadId!: string;

    @Field((type) => CallDirection)
    direction!: CallDirection;

    @Field((type) => CallSource)
    source!: CallSource;

    @Field((type) => CallStatus)
    status!: CallStatus;

    @Field((type) => CallFailReason, { nullable: true })
    failReason?: CallFailReason;

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
    createdByName!: string;
}
