import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class OnboardingProfile {
  @Field(() => ID)
  id: string;

  @Field()
  leadId: string;

  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) mobile?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) status?: string;

  @Field({ nullable: true }) createdAt?: Date;
  @Field({ nullable: true }) updatedAt?: Date;
}
