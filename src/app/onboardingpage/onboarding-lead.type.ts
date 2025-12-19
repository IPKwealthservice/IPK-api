import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class OnboardingLead {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  source: string;

  @Field()
  mobile: string;

  @Field()
  status: "NEW" | "COMPLETED";
}
