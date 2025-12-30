import { Injectable } from "@nestjs/common";
import {
  QUESTION_SCORES,
  GRADE_MAP,
  RISK_PROFILE_MAP,
} from "./risk.config";
import { RiskAnswerInput } from './dto/risk-type.inputs';


@Injectable()
export class OnboardingRiskService {
  calculateRisk(answers: RiskAnswerInput[]) {
    let totalScore = 0;
    let maxScore = 0;

    for (const ans of answers) {
      const score =
        QUESTION_SCORES[ans.questionId]?.[ans.option];

      if (!score) {
        throw new Error(
          `Invalid answer for question ${ans.questionId}`
        );
      }

      totalScore += score;
      maxScore = Math.max(maxScore, score);
    }

    const grade = GRADE_MAP[maxScore];
    const riskProfile = RISK_PROFILE_MAP[grade];

    return {
      totalScore,
      maxScore,
      grade,
      riskProfile,
      speedometerValue: maxScore * 20,
    };
  }
}
