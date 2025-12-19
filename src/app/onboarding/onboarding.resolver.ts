import { Resolver, Mutation, Args, Query } from "@nestjs/graphql";
import { OnboardingService } from "./onboarding.service";
import { SaveOnboardingInput } from "./onboarding.input";
import { OnboardingProfile } from "./onboarding.model";

@Resolver(() => OnboardingProfile)
export class OnboardingResolver {
  constructor(private service: OnboardingService) {}

  @Mutation(() => OnboardingProfile)
  saveOnboarding(
    @Args("input") input: SaveOnboardingInput
  ) {
    return this.service.save(input);
  }

  @Mutation(() => OnboardingProfile)
  completeOnboarding(
    @Args("leadId") leadId: string
  ) {
    return this.service.markCompleted(leadId);
  }

  @Query(() => [OnboardingProfile])
  onboardingByStatus(
    @Args("status") status: string
  ) {
    return this.service.listByStatus(status);
  }
}
