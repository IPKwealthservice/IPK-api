import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class OnboardingProfile {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  dob?: Date;

  @Field({ nullable: true })
  status?: string;
}
