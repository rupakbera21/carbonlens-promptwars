import { NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { successResponse } from "@/shared/types/api-response";
import { ScoreService } from "@/application/services/score-service";
import { PrismaActivityRepository } from "@/infrastructure/database/activity-repository-impl";
import { ScoreCalculator } from "@/domain/services/score-calculator";
import {
  getWeekStart,
  getWeekEnd,
  getDayStart,
  getDayEnd,
  getHourStart,
  getHourEnd,
} from "@/shared/utils/date";

const activityRepo = new PrismaActivityRepository();
const scoreService = new ScoreService(activityRepo);

/**
 * GET /api/scores — Get current score and history.
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const now = new Date();

    // Recalculate current period scores on GET to ensure data freshness and correct scoring formulas
    await Promise.all([
      scoreService.calculateAndStore(
        auth.userId,
        "weekly",
        getWeekStart(now),
        getWeekEnd(now),
      ),
      scoreService.calculateAndStore(
        auth.userId,
        "daily",
        getDayStart(now),
        getDayEnd(now),
      ),
      scoreService.calculateAndStore(
        auth.userId,
        "hourly",
        getHourStart(now),
        getHourEnd(now),
      ),
    ]);

    const [currentScore, hourlyHistory, dailyHistory, weeklyHistory, monthlyHistory] =
      await Promise.all([
        scoreService.getCurrentScore(auth.userId),
        scoreService.getScoreHistory(auth.userId, "hourly", 24),
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
        hourlyHistory,
        dailyHistory,
        weeklyHistory,
        monthlyHistory,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
