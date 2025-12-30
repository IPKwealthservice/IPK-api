import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class RiskTypeResult {
  @Field(() => Int)
  totalScore: number;

  @Field(() => Int)
  maxScore: number;

  @Field()
  grade: string;

  @Field()
  riskProfile: string;

  @Field(() => Int)
  speedometerValue: number;
}
