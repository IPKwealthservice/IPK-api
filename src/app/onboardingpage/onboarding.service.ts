// src/app/onboarding/onboarding.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * NEW onboarding leads (status = IN_PROGRESS / NEW)
   */
  async getNewLeads() {
    return this.prisma.onboardingProfile.findMany({
      where: {
        status: "IN_PROGRESS",
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        leadId: true,
        name: true,
        mobile: true,
        source: true,
        status: true,
      },
    });
  }

  /**
   * COMPLETED onboarding leads
   */
  async getCompletedLeads() {
    return this.prisma.onboardingProfile.findMany({
      where: {
        status: "COMPLETED",
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        leadId: true,
        name: true,
        mobile: true,
        source: true,
        status: true,
      },
    });
  }
}
