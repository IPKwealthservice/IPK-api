import { Injectable } from "@nestjs/common";

@Injectable()
export class SuitabilityService {
  getSuitabilityScore() {
    // Example logic – replace with real calculation
    return {
      score: 65,
      category: "Moderate",
    };
  }
}
