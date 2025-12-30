import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { OnboardingRiskService } from "./onboarding-risk.service";
import { RiskTypeResult } from "./models/risk-type.model";
import { RiskAnswerInput } from "./dto/risk-type.inputs";

@Resolver()
export class OnboardingRiskResolver {
  constructor(
    private readonly riskService: OnboardingRiskService
  ) {}

  @Mutation(() => RiskTypeResult)
  calculateRiskType(
    @Args("answers", { type: () => [RiskAnswerInput] })
    answers: RiskAnswerInput[]
  ) {
    return this.riskService.calculateRisk(answers);
  }
}
