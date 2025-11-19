import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { UpdateLeadDetailsInput } from './update-lead-details.input';

@InputType()
export class UpdateIpkLeaddInput extends PartialType(UpdateLeadDetailsInput) {
  @Field(() => ID)
  id!: string;
}
