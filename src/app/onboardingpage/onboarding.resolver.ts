import { Resolver, Query, Args } from '@nestjs/graphql';
import { OnboardingService } from './onboarding.service';
import { OnboardingProfile } from './models/onboarding.models';

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
