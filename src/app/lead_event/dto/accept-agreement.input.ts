import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AcceptAgreementInput {
  @Field()
  leadId: string;

  @Field({ nullable: true })
  ipAddress?: string;
}
