import { Module } from "@nestjs/common";
import { OnboardingAuthModule } from "../../app/onboarding-auth/onboarding-auth.module";

@Module({
  imports: [
    OnboardingAuthModule,
  ],
})
export class AppModule {}
