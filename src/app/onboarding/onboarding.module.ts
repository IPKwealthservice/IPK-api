import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { ClientOnboardingSchema } from './models/onboarding.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ClientOnboarding', schema: ClientOnboardingSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
