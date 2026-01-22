import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class OnboardingLead {
  @Field(() => String)
  id!: string;
}
