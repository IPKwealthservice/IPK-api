import { Resolver, Query } from "@nestjs/graphql";
import { OnboardingService } from "../onboarding/onboarding.service";
import { OnboardingLead } from "./onboarding-lead.type";

@Resolver()
export class OnboardingResolver {
  constructor(private readonly service: OnboardingService) {}
@Query(() => [OnboardingLead])
onboardingNewLeads() {
  return this.service.getNewLeads();
}

@Query(() => [OnboardingLead])
onboardingCompletedLeads() {
  return this.service.getCompletedLeads();
}

}
