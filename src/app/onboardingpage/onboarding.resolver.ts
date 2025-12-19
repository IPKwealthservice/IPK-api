import { Resolver, Query } from "@nestjs/graphql";
import { OnboardingService } from "./onboarding.service";
import { OnboardingLead } from "./onboarding-lead.type";

@Resolver(() => OnboardingLead)
export class OnboardingResolver {
  constructor(private readonly service: OnboardingService) {}

  /* ================= NEW ONBOARDING LEADS ================= */

  @Query(() => [OnboardingLead])
  onboardingNewLeads() {
    return this.service.getNewLeads();
  }

  /* ================= COMPLETED ONBOARDING LEADS ================= */

  @Query(() => [OnboardingLead])
  onboardingCompletedLeads() {
    return this.service.getCompletedLeads();
  }
}
