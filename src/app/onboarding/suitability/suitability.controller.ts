import { Controller, Get } from "@nestjs/common";
import { SuitabilityService } from "./suitability.service";

@Controller("suitability")
export class SuitabilityController {
  constructor(private readonly suitabilityService: SuitabilityService) {}

  @Get("score")
  getScore() {
    return this.suitabilityService.getSuitabilityScore();
  }
}
