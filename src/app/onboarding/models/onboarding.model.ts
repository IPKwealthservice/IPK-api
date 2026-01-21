import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class OnboardingProfile {
  @Field(() => ID)
  _id: string;

  @Field(() => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  dob?: Date;

  @Field({ nullable: true })
  mobile?: string;

  @Field({ nullable: true })
  source?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  clientId?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  location?: string;
}
