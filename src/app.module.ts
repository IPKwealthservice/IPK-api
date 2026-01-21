import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaAppModule } from 'prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountApplicationModule } from './app/account_application/account-application.module';
import { AuthModule } from './app/auth/auth.module';
import { ApiConfigModule } from './app/core/config/config.module';
import { FirebaseModule } from './app/core/firebase/firebase.module';
import { GraphqlModule } from './app/core/graphql/graphql.module';
import './app/enums/app.enum';
import { LeadCallLogModule } from './app/lead/lead-call-log/lead-call-log.module';
import { IpkLeaddModule } from './app/lead/ipk-leadd.module';
import { RmModule } from './app/salesrm/rm.module';
import { UserModule } from './app/user/user-api.module';
import { UserApiService } from './app/user/user-api.service';
import { HealthModule } from './common/health.module';
import { OnboardingAuthModule } from "./app/onboarding-auth/onboarding-auth.module";
import { MongoModule } from './database/mongo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ add this

    GraphqlModule,
    ApiConfigModule,
    PrismaAppModule,
    FirebaseModule,
    AuthModule,

    MongoModule, // ✅ keep this

    IpkLeaddModule,
    LeadCallLogModule,
    RmModule,
    UserModule,
    AccountApplicationModule,
    HealthModule,

    OnboardingAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserApiService],
})
export class AppModule {}