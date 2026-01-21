import { Args, Query, Resolver } from '@nestjs/graphql';
import { OnboardingLead } from './onboarding-lead.type';
import { OnboardingService } from './onboarding.service';

@Resolver(() => OnboardingLead)
export class OnboardingResolver {
  constructor(private readonly service: OnboardingService) {}

  @Query(() => [OnboardingLead])
  onboardingByStatus(
    @Args('status', { type: () => String }) status: string,
  ) {
    return this.service.findByStatus(status);
  }
}
