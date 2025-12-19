// src/app/onboarding-auth/onboarding-auth.module.ts
import { Module } from "@nestjs/common";
import { OnboardingAuthService } from "./onboarding-auth.service";
import { OnboardingAuthResolver } from "./onboarding-auth.resolver";

@Module({
  providers: [OnboardingAuthService, OnboardingAuthResolver],
})
export class OnboardingAuthModule {}
