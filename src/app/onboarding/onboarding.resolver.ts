import { Args, Query, Resolver } from '@nestjs/graphql';
import { OnboardingProfile } from './models/onboarding.model';
import { OnboardingService } from './onboarding.service';

@Resolver(() => OnboardingProfile)
export class OnboardingResolver {
  constructor(private readonly service: OnboardingService) {}

  @Query(() => [OnboardingProfile])
  onboardingByStatus(
    @Args('status', { type: () => String }) status: string,
  ) {
    return this.service.findByStatus(status);
  }
}
