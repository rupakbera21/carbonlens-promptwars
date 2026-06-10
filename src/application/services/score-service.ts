import { prisma } from "@/infrastructure/database/prisma-client";
import type { ActivityRepository } from "@/domain/repositories/activity-repository";
import type { CarbonScore, CategoryBreakdown } from "@/domain/value-objects/carbon-score";
import { ScoreCalculator } from "@/domain/services/score-calculator";

/**
 * ScoreService — computes and persists carbon scores.
 * Scores are pre-computed and stored in the carbon_scores table
 * to avoid expensive re-aggregation on every dashboard load.
 */
export class ScoreService {
  constructor(private readonly activityRepo: ActivityRepository) {}

  async calculateAndStore(
    userId: string,
    periodType: "weekly" | "monthly",
    periodStart: Date,
    periodEnd: Date,
  ): Promise<CarbonScore> {
    const activities = await this.activityRepo.findByUserAndDateRange(
      userId,
      periodStart,
      periodEnd,
    );

    const { score, totalCo2eKg, breakdown } = ScoreCalculator.compute(activities);

    const record = await prisma.carbonScore.upsert({
      where: {
        id: await this.findExistingScoreId(userId, periodType, periodStart),
      },
      update: {
        score,
        totalCo2eKg,
        breakdown: breakdown as any,
        calculatedAt: new Date(),
      },
      create: {
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

    return {
      ...record,
      breakdown: record.breakdown as unknown as CategoryBreakdown,
    };
  }

  async getCurrentScore(userId: string): Promise<CarbonScore | null> {
    const record = await prisma.carbonScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: "desc" },
    });

    if (!record) return null;

    return {
      ...record,
      breakdown: record.breakdown as unknown as CategoryBreakdown,
    };
  }

  async getScoreHistory(
    userId: string,
    periodType: "weekly" | "monthly",
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
  ): Promise<string> {
    const existing = await prisma.carbonScore.findFirst({
      where: { userId, periodType, periodStart },
      select: { id: true },
    });
    // Return existing ID or generate a new UUID-like placeholder
    // that will trigger the "create" branch of upsert
    return existing?.id ?? "00000000-0000-0000-0000-000000000000";
  }
}
