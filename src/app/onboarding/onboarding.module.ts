import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ClientOnboardingSchema } from './models/onboarding.schema';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingResolver } from './onboarding.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ClientOnboarding', schema: ClientOnboardingSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingResolver, OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
