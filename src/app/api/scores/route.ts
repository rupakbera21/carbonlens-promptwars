import { NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { successResponse } from "@/shared/types/api-response";
import { ScoreService } from "@/application/services/score-service";
import { PrismaActivityRepository } from "@/infrastructure/database/activity-repository-impl";
import { ScoreCalculator } from "@/domain/services/score-calculator";

const activityRepo = new PrismaActivityRepository();
const scoreService = new ScoreService(activityRepo);

/**
 * GET /api/scores — Get current score and history.
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const [currentScore, dailyHistory, weeklyHistory, monthlyHistory] = await Promise.all([
      scoreService.getCurrentScore(auth.userId),
      scoreService.getScoreHistory(auth.userId, "daily", 14),
      scoreService.getScoreHistory(auth.userId, "weekly", 8),
      scoreService.getScoreHistory(auth.userId, "monthly", 6),
    ]);

    return NextResponse.json(
      successResponse({
        current: currentScore,
        explanation: currentScore
          ? ScoreCalculator.explainScore(currentScore.score)
          : "No data yet. Log your first activity to see your score!",
        dailyHistory,
        weeklyHistory,
        monthlyHistory,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
