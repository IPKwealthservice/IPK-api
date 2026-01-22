// src/app/onboarding-auth/onboarding-auth.model.ts
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class OtpResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  // Exposed only for dev/testing; in production, remove or mask
  @Field({ nullable: true })
  otp?: string;
}
