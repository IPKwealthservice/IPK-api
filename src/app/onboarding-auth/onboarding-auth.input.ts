// src/app/onboarding-auth/onboarding-auth.input.ts
import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class SendOtpInput {
  @Field()
  mobile: string;
}

@InputType()
export class VerifyOtpInput {
  @Field()
  mobile: string;

  @Field()
  otp: string;
}
