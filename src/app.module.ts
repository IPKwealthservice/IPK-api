import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { ConfigModule } from '@nestjs/config';
=======
//import { ConfigModule } from '@nestjs/config';
>>>>>>> de6c8d49de0a8545ccca7cd14e056ee931d53c29
import { PrismaAppModule } from 'prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountApplicationModule } from './app/account_application/account-application.module';
import { AuthModule } from './app/auth/auth.module';
import { ApiConfigModule } from './app/core/config/config.module';
//import { FirebaseModule } from './app/core/firebase/firebase.module';
import { GraphqlModule } from './app/core/graphql/graphql.module';
import './app/enums/app.enum';
import { IpkLeaddModule } from './app/lead/ipk-leadd.module';
import { LeadCallLogModule } from './app/lead/lead-call-log/lead-call-log.module';
//import { OnboardingAuthModule } from './app/onboarding-auth/onboarding-auth.module';
//import { OnboardingModule } from './app/onboarding/onboarding.module';
import { RmModule } from './app/salesrm/rm.module';
import { UserModule } from './app/user/user-api.module';
import { UserApiService } from './app/user/user-api.service';
import { HealthModule } from './common/health.module';
<<<<<<< HEAD

@Module({
  imports: [
=======
import { OnboardingAuthModule } from "./app/onboarding-auth/onboarding-auth.module";
<<<<<<< HEAD
import { MongoModule } from './database/mongo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ add this
=======
import { OnboardingModule } from './app/onboarding/onboarding.module';

@Module({
  imports: [
>>>>>>> de6c8d49de0a8545ccca7cd14e056ee931d53c29

>>>>>>> bfe5d3d11aa65320d2f7a20e472e1b4d26f57eba
    GraphqlModule,
    ApiConfigModule,
    PrismaAppModule,
    //FirebaseModule,
    AuthModule,

<<<<<<< HEAD
    MongoModule, // ✅ keep this
=======
    //MongoModule, // ✅ keep this
>>>>>>> de6c8d49de0a8545ccca7cd14e056ee931d53c29

    IpkLeaddModule,
    LeadCallLogModule,
    RmModule,
    UserModule,
    AccountApplicationModule,
    HealthModule,

    //DatabaseModule, // Disabled - MongoDB not running
    //OnboardingAuthModule, // Disabled - requires MongoDB
    //OnboardingModule, // Disabled - requires MongoDB
  ],
  controllers: [AppController],
  providers: [AppService, UserApiService],
})
export class AppModule { }
