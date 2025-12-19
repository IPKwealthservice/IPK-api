import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class SaveOnboardingInput {
  @Field()
  leadId: string;

  @Field() mobile: string;

  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) gender?: string;
  @Field({ nullable: true }) dob?: string;
  @Field({ nullable: true }) age?: number;
  @Field({ nullable: true }) occupation?: string;
  @Field({ nullable: true }) income?: string;

  @Field({ nullable: true }) commAddress?: string;
  @Field({ nullable: true }) permAddress?: string;

  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) whatsapp?: string;

  @Field({ nullable: true }) dpId?: string;
  @Field({ nullable: true }) clientCode?: string;

  @Field({ nullable: true }) billName?: string;
  @Field({ nullable: true }) gst?: string;
}
