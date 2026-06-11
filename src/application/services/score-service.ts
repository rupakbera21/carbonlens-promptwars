import { prisma } from "@/infrastructure/database/prisma-client";
import type { ActivityRepository } from "@/domain/repositories/activity-repository";
import type { CarbonScore, CategoryBreakdown } from "@/domain/value-objects/carbon-score";
import { ScoreCalculator } from "@/domain/services/score-calculator";
import { getWeekStart, getWeekEnd } from "@/shared/utils/date";

/**
 * ScoreService — computes and persists carbon scores.
 * Scores are pre-computed and stored in the carbon_scores table
 * to avoid expensive re-aggregation on every dashboard load.
 */
export class ScoreService {
  constructor(private readonly activityRepo: ActivityRepository) {}

  async calculateAndStore(
    userId: string,
    periodType: "hourly" | "daily" | "weekly" | "monthly",
    periodStart: Date,
    periodEnd: Date,
  ): Promise<CarbonScore> {
    const activities = await this.activityRepo.findByUserAndDateRange(
      userId,
      periodStart,
      periodEnd,
    );

    const { score, totalCo2eKg, breakdown } = ScoreCalculator.compute(activities);

    const existingId = await this.findExistingScoreId(userId, periodType, periodStart);

    let record;
    if (existingId) {
      record = await prisma.carbonScore.update({
        where: { id: existingId },
        data: {
          score,
          totalCo2eKg,
          breakdown: breakdown as any,
          calculatedAt: new Date(),
        },
      });
    } else {
      record = await prisma.carbonScore.create({
        data: {
          userId,
          score,
          totalCo2eKg,
          breakdown: breakdown as any,
          periodType,
          periodStart,
          periodEnd,
          calculatedAt: new Date(),
        },
      });
    }

    return {
      ...record,
      breakdown: record.breakdown as unknown as CategoryBreakdown,
    };
  }

  async getCurrentScore(userId: string, periodType = "weekly"): Promise<CarbonScore | null> {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);

    // 1. Get weekly activities for emissions and breakdown
    const weeklyActivities = await this.activityRepo.findByUserAndDateRange(
      userId,
      weekStart,
      weekEnd,
    );

    // 2. Get last 100 activities of all time to compute the rolling score
    const allActivities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { activityDate: "desc" },
      take: 100,
    });
    // Reverse to process chronologically
    allActivities.reverse();

    // If a user has never logged any activities ever, return null
    if (allActivities.length === 0 && weeklyActivities.length === 0) {
      return null;
    }

    const weeklyBreakdown: CategoryBreakdown = {
      transport: 0,
      energy: 0,
      food: 0,
      shopping: 0,
    };

    let weeklyTotalCo2e = 0;
    for (const activity of weeklyActivities) {
      const category = activity.category.toLowerCase() as keyof CategoryBreakdown;
      if (category in weeklyBreakdown) {
        weeklyBreakdown[category] += activity.co2eKg;
      }
    }
    // Round breakdown values
    for (const key of Object.keys(weeklyBreakdown) as (keyof CategoryBreakdown)[]) {
      weeklyBreakdown[key] = Math.round(weeklyBreakdown[key] * 1000) / 1000;
      weeklyTotalCo2e += weeklyBreakdown[key];
    }
    weeklyTotalCo2e = Math.round(weeklyTotalCo2e * 1000) / 1000;

    const baselines: Record<string, number> = {
      transport: 15,
      energy: 20,
      food: 10,
      shopping: 10,
    };

    let score = 50;
    for (const activity of allActivities) {
      const category = activity.category.toLowerCase();
      const baseline = baselines[category] || 10;
      if (activity.co2eKg < baseline) {
        score += 8;
      } else {
        score -= 4;
      }
    }
    score = Math.max(0, Math.min(100, score));

    return {
      id: "current-rolling",
      userId,
      score,
      totalCo2eKg: weeklyTotalCo2e,
      breakdown: weeklyBreakdown,
      periodType: "weekly",
      periodStart: weekStart,
      periodEnd: weekEnd,
      calculatedAt: new Date(),
    };
  }


  async getScoreHistory(
    userId: string,
    periodType: "hourly" | "daily" | "weekly" | "monthly",
    limit = 12,
  ): Promise<CarbonScore[]> {
    const records = await prisma.carbonScore.findMany({
      where: { userId, periodType },
      orderBy: { periodStart: "desc" },
      take: limit,
    });

    return records.map((r) => ({
      ...r,
      breakdown: r.breakdown as unknown as CategoryBreakdown,
    }));
  }

  private async findExistingScoreId(
    userId: string,
    periodType: string,
    periodStart: Date,
  ): Promise<string | null> {
    const existing = await prisma.carbonScore.findFirst({
      where: { userId, periodType, periodStart },
      select: { id: true },
    });
    return existing?.id || null;
  }
}
