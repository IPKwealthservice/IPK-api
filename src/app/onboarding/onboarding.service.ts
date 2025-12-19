import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { SaveOnboardingInput } from "./onboarding.input";

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async save(input: SaveOnboardingInput) {
    return this.prisma.onboardingProfile.upsert({
      where: { leadId: input.leadId },
      update: {
        ...input,
        dob: input.dob ? new Date(input.dob) : undefined,
      },
      create: {
        ...input,
        dob: input.dob ? new Date(input.dob) : undefined,
        status: "IN_PROGRESS",
      },
    });
  }

  async markCompleted(leadId: string) {
    return this.prisma.onboardingProfile.update({
      where: { leadId },
      data: { status: "COMPLETED" },
    });
  }

  async listByStatus(status: string) {
    return this.prisma.onboardingProfile.findMany({
      where: { status },
      orderBy: { updatedAt: "desc" },
    });
  }
}
