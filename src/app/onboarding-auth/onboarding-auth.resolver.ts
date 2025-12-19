// src/app/onboarding-auth/onboarding-auth.resolver.ts
import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { OnboardingAuthService } from "./onboarding-auth.service";
import { SendOtpInput, VerifyOtpInput } from "./onboarding-auth.input";
import { OtpResponse } from "./onboarding-auth.model";

@Resolver()
export class OnboardingAuthResolver {
  constructor(private readonly service: OnboardingAuthService) {}

  @Mutation(() => OtpResponse)
  sendOnboardingOtp(
    @Args("input") input: SendOtpInput
  ) {
    return this.service.sendOtp(input.mobile);
  }

  @Mutation(() => OtpResponse)
  verifyOnboardingOtp(
    @Args("input") input: VerifyOtpInput
  ) {
    return this.service.verifyOtp(input.mobile, input.otp);
  }
}
