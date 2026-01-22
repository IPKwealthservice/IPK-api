import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel('ClientOnboarding')
    private readonly onboardingModel: Model<any>,
  ) {}

  /* ================= REST API METHODS ================= */

  async create(data: any) {
    return this.onboardingModel.create({
      ...data,
      dob: data.dob ? new Date(data.dob) : null,
    });
  }

  async findByStatus(status: string) {
  return this.onboardingModel.find({ status });
}


  async findById(id: string) {
    return this.onboardingModel.findById(id);
  }

  async update(id: string, data: any) {
    return this.onboardingModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  /* ================= EXISTING RESOLVER METHODS ================= */
  /* These are REQUIRED because onboarding.resolver.ts uses them */

  async getNewLeads() {
    return this.onboardingModel.find({ status: 'NEW' });
  }

  async getCompletedLeads() {
    return this.onboardingModel.find({ status: 'COMPLETED' });
  }
}
