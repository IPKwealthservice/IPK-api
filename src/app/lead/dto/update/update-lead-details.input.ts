import { Field, ID, InputType } from '@nestjs/graphql';
import { ClientStage, LeadStageFilter, PhoneLabel } from '../../enums/ipk-leadd.enum';
import { OccupationInput } from './../create/create-lead.input';

@InputType()
export class UpdateLeadDetailsInput {
  @Field(() => ID)
  leadId!: string;

  // Basic identity
  @Field({ nullable: true }) firstName?: string;
  @Field({ nullable: true }) lastName?: string;
  @Field({ nullable: true }) name?: string;

  // Contact
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) location?: string;

  // Demographics
  @Field({ nullable: true }) gender?: string;
  @Field({ nullable: true }) age?: number;

  // Work/occupation: use occupations[] only
  @Field(() => [OccupationInput], { nullable: true }) occupations?: OccupationInput[];

  // Product interest
  @Field({ nullable: true }) product?: string;
  @Field({ nullable: true }) investmentRange?: string;
  @Field({ nullable: true }) sipAmount?: number;

  // Referral
  @Field({ nullable: true }) referralCode?: string;
  @Field({ nullable: true }) referralName?: string;
  @Field({ nullable: true }) clientCode?: string;

  // Profile
  @Field({ nullable: true }) bioText?: string;
  @Field({ nullable: true }) remark?: string;
  @Field({ nullable: true }) nextActionDueAt?: string;

  // Optional RM intent/priority filter
  @Field(() => LeadStageFilter, { nullable: true }) stageFilter?: LeadStageFilter;
  @Field(() => ClientStage, { nullable: true }) ClientStage?: ClientStage;

  // Phone collection updates
  @Field(() => [UpdateLeadPhoneInput], { nullable: true })
  phones?: UpdateLeadPhoneInput[];
}

@InputType()
export class UpdateLeadPhoneInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => PhoneLabel, { defaultValue: PhoneLabel.MOBILE })
  label?: PhoneLabel;

  @Field(() => String)
  number!: string;

  @Field(() => Boolean, { nullable: true })
  isPrimary?: boolean;

  @Field(() => Boolean, { nullable: true })
  isWhatsapp?: boolean;
}
