import type { Activity } from "../entities/activity";
import type { CategoryBreakdown } from "../value-objects/carbon-score";
import { calculateScore } from "../value-objects/carbon-score";

/**
 * ScoreCalculator — domain service that computes a user's CarbonScore
 * from a set of activities in a time period.
 *
 * The breakdown shows exactly which categories contribute what percentage,
 * ensuring full transparency (no black-box).
 */
export class ScoreCalculator {
  /**
   * Compute the score and breakdown from a list of activities.
   */
  static compute(activities: Activity[]): {
    score: number;
    totalCo2eKg: number;
    breakdown: CategoryBreakdown;
  } {
    const breakdown: CategoryBreakdown = {
      transport: 0,
      energy: 0,
      food: 0,
      shopping: 0,
    };

    for (const activity of activities) {
      const category = activity.category as keyof CategoryBreakdown;
      if (category in breakdown) {
        breakdown[category] += activity.co2eKg;
      }
    }

    // Round each category
    for (const key of Object.keys(breakdown) as (keyof CategoryBreakdown)[]) {
      breakdown[key] = Math.round(breakdown[key] * 1000) / 1000;
    }

    const totalCo2eKg = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    const baselines: Record<string, number> = {
      transport: 15,
      energy: 20,
      food: 10,
      shopping: 10,
    };

    let score = 50;
    if (activities.length > 0) {
      for (const activity of activities) {
        const category = activity.category.toLowerCase();
        const baseline = baselines[category] || 10;
        if (activity.co2eKg < baseline) {
          score += 8;
        } else {
          score -= 4;
        }
      }
    }
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      totalCo2eKg: Math.round(totalCo2eKg * 1000) / 1000,
      breakdown,
    };
  }

  /**
   * Explain the score in human-readable terms.
   */
  static explainScore(score: number): string {
    if (score >= 90) return "Excellent! Your carbon footprint is very low.";
    if (score >= 70) return "Good. You're below the average carbon footprint.";
    if (score >= 50) return "Average. There's room for improvement.";
    if (score >= 30) return "Above average. Consider reducing high-impact activities.";
    return "High footprint. Focus on your largest emission category first.";
  }
}
