import { InputType, Field, Int } from "@nestjs/graphql";

@InputType()
export class RiskAnswerInput {
  @Field(() => Int)
  questionId: number;

  @Field()
  option: string;
}
