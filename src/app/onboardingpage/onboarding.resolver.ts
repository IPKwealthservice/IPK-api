import { Args, Query, Resolver } from '@nestjs/graphql';
import { OnboardingProfile } from '../onboarding/models/onboarding.model';
import { OnboardingService } from '../onboarding/onboarding.service';

@Resolver(() => OnboardingProfile)
export class OnboardingResolver {
  constructor(private readonly service: OnboardingService) {}

  @Query(() => [OnboardingProfile])
  onboardingByStatus(
    @Args('status', { type: () => String }) status: string,
  ) {
    return this.service.findByStatus(status);
  }

  @Query(() => [OnboardingProfile])
  onboardingNewLeads() {
    return this.service.getNewLeads();
  }

  @Query(() => [OnboardingProfile])
  onboardingCompletedLeads() {
    return this.service.getCompletedLeads();
  }
}
