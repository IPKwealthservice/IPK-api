import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Document } from "mongoose";

export type ClientOnboardingDocument = Document & {
  dob?: Date | null;
  status?: string;
  // keep extra dynamic fields (because you spread ...data)
  [key: string]: unknown;
};

export type OnboardingPayload = {
  dob?: string | Date | null;
  status?: string;
  [key: string]: unknown;
};

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel("ClientOnboarding")
    private readonly onboardingModel: Model<ClientOnboardingDocument>,
  ) {}

  /* ================= REST API METHODS ================= */

  async create(data: OnboardingPayload): Promise<ClientOnboardingDocument> {
    const dob =
      data.dob != null && data.dob !== ""
        ? new Date(typeof data.dob === "string" ? data.dob : data.dob)
        : null;

    return this.onboardingModel.create({
      ...data,
      dob,
    });
  }

  async findByStatus(status: string): Promise<ClientOnboardingDocument[]> {
    return this.onboardingModel.find({ status }).exec();
  }

  async findById(id: string): Promise<ClientOnboardingDocument | null> {
    return this.onboardingModel.findById(id).exec();
  }

  async update(
    id: string,
    data: OnboardingPayload,
  ): Promise<ClientOnboardingDocument | null> {
    return this.onboardingModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  /* ================= EXISTING RESOLVER METHODS ================= */
  /* These are REQUIRED because onboarding.resolver.ts uses them */

  async getNewLeads(): Promise<ClientOnboardingDocument[]> {
    return this.onboardingModel.find({ status: "NEW" }).exec();
  }

  async getCompletedLeads(): Promise<ClientOnboardingDocument[]> {
    return this.onboardingModel.find({ status: "COMPLETED" }).exec();
  }
}
