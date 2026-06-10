import type { ActivityRepository } from "@/domain/repositories/activity-repository";
import type { CategoryBreakdown } from "@/domain/value-objects/carbon-score";
import { ScoreCalculator } from "@/domain/services/score-calculator";
import { getLargestCategory } from "@/domain/value-objects/carbon-score";
import {
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
} from "@/shared/utils/date";

export interface InsightData {
  currentWeek: WeeklyInsight;
  currentMonth: MonthlyInsight;
  trends: TrendPoint[];
  largestCategory: string | null;
  savingsOpportunities: SavingsOpportunity[];
}

export interface WeeklyInsight {
  totalCo2eKg: number;
  breakdown: CategoryBreakdown;
  changeFromLastWeek: number | null;
}

export interface MonthlyInsight {
  totalCo2eKg: number;
  breakdown: CategoryBreakdown;
  changeFromLastMonth: number | null;
}

export interface TrendPoint {
  periodStart: string;
  totalCo2eKg: number;
  score: number;
}

export interface SavingsOpportunity {
  category: string;
  description: string;
  potentialSavingKg: number;
}

/**
 * InsightService — generates weekly/monthly trends and savings analysis.
 * All computations use the ScoreCalculator domain service.
 */
export class InsightService {
  constructor(private readonly activityRepo: ActivityRepository) {}

  async getInsights(userId: string): Promise<InsightData> {
    const now = new Date();

    // Current week
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);
    const weekActivities = await this.activityRepo.findByUserAndDateRange(
      userId,
      weekStart,
      weekEnd,
    );
    const weekResult = ScoreCalculator.compute(weekActivities);

    // Previous week for comparison
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setMilliseconds(-1);
    const prevWeekActivities = await this.activityRepo.findByUserAndDateRange(
      userId,
      prevWeekStart,
      prevWeekEnd,
    );
    const prevWeekResult = ScoreCalculator.compute(prevWeekActivities);

    // Current month
    const monthStart = getMonthStart(now);
    const monthEnd = getMonthEnd(now);
    const monthActivities = await this.activityRepo.findByUserAndDateRange(
      userId,
      monthStart,
      monthEnd,
    );
    const monthResult = ScoreCalculator.compute(monthActivities);

    // Previous month for comparison
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setMilliseconds(-1);
    const prevMonthActivities = await this.activityRepo.findByUserAndDateRange(
      userId,
      prevMonthStart,
      prevMonthEnd,
    );
    const prevMonthResult = ScoreCalculator.compute(prevMonthActivities);

    // Weekly trends (last 8 weeks)
    const trends: TrendPoint[] = [];
    for (let i = 7; i >= 0; i--) {
      const trendWeekStart = new Date(weekStart);
      trendWeekStart.setDate(trendWeekStart.getDate() - i * 7);
      const trendWeekEnd = new Date(trendWeekStart);
      trendWeekEnd.setDate(trendWeekEnd.getDate() + 6);
      trendWeekEnd.setHours(23, 59, 59, 999);

      const trendActivities = await this.activityRepo.findByUserAndDateRange(
        userId,
        trendWeekStart,
        trendWeekEnd,
      );
      const trendResult = ScoreCalculator.compute(trendActivities);

      trends.push({
        periodStart: trendWeekStart.toISOString().split("T")[0],
        totalCo2eKg: trendResult.totalCo2eKg,
        score: trendResult.score,
      });
    }

    // Savings opportunities based on current breakdown
    const savingsOpportunities = this.identifySavings(weekResult.breakdown);

    return {
      currentWeek: {
        totalCo2eKg: weekResult.totalCo2eKg,
        breakdown: weekResult.breakdown,
        changeFromLastWeek:
          prevWeekResult.totalCo2eKg > 0
            ? weekResult.totalCo2eKg - prevWeekResult.totalCo2eKg
            : null,
      },
      currentMonth: {
        totalCo2eKg: monthResult.totalCo2eKg,
        breakdown: monthResult.breakdown,
        changeFromLastMonth:
          prevMonthResult.totalCo2eKg > 0
            ? monthResult.totalCo2eKg - prevMonthResult.totalCo2eKg
            : null,
      },
      trends,
      largestCategory: getLargestCategory(weekResult.breakdown),
      savingsOpportunities,
    };
  }

  private identifySavings(breakdown: CategoryBreakdown): SavingsOpportunity[] {
    const opportunities: SavingsOpportunity[] = [];

    if (breakdown.transport > 20) {
      opportunities.push({
        category: "transport",
        description:
          "Switching 2 car trips to public transport could save ~10 kg CO₂e/week",
        potentialSavingKg: 10,
      });
    }

    if (breakdown.food > 15) {
      opportunities.push({
        category: "food",
        description:
          "Replacing one beef meal with plant-based could save ~5 kg CO₂e/week",
        potentialSavingKg: 5,
      });
    }

    if (breakdown.energy > 10) {
      opportunities.push({
        category: "energy",
        description: "Reducing standby power could save ~2 kg CO₂e/week",
        potentialSavingKg: 2,
      });
    }

    return opportunities.sort((a, b) => b.potentialSavingKg - a.potentialSavingKg);
  }
}
