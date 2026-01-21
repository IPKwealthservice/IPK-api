import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { OnboardingAuthModule } from './onboarding-auth.module';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI as string),

    OnboardingAuthModule,
    OnboardingModule,
  ],
})
export class AppModule {}
