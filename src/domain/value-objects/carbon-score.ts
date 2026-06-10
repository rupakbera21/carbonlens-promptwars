import type { ActivityCategory } from "../entities/activity";

/**
 * CarbonScore value object — an immutable score with explainable breakdown.
 *
 * Score is 0-100 where 100 = lowest carbon footprint.
 * The score is inversely proportional to CO₂e emissions:
 *   - 0 kg/week → score 100
 *   - ≥200 kg/week → score 0
 *
 * The linear scale and thresholds are intentionally transparent
 * so users can verify their own score.
 */
export interface CarbonScore {
  readonly id: string;
  readonly userId: string;
  readonly score: number;
  readonly totalCo2eKg: number;
  readonly breakdown: CategoryBreakdown;
  readonly periodType: string;
  readonly periodStart: Date;
  readonly periodEnd: Date;
  readonly calculatedAt: Date;
}

export interface CategoryBreakdown {
  transport: number;
  energy: number;
  food: number;
  shopping: number;
}

/**
 * Weekly CO₂e thresholds for score calculation (kg).
 * Based on global average of ~85 kg CO₂e/week (4.5 tonnes/year).
 * These thresholds are configurable per region.
 */
export const SCORE_THRESHOLDS = {
  /** CO₂e at which score is 0 */
  MAX_CO2E_KG: 200,
  /** CO₂e at which score is 100 */
  MIN_CO2E_KG: 0,
} as const;

/**
 * Pure function: calculates a 0-100 score from total weekly CO₂e.
 * Fully deterministic and testable with no side effects.
 */
export function calculateScore(totalCo2eKg: number): number {
  if (totalCo2eKg <= SCORE_THRESHOLDS.MIN_CO2E_KG) return 100;
  if (totalCo2eKg >= SCORE_THRESHOLDS.MAX_CO2E_KG) return 0;

  const range =
    SCORE_THRESHOLDS.MAX_CO2E_KG - SCORE_THRESHOLDS.MIN_CO2E_KG;
  const normalized =
    (totalCo2eKg - SCORE_THRESHOLDS.MIN_CO2E_KG) / range;

  return Math.round(100 * (1 - normalized));
}

/**
 * Returns the category contributing the most emissions.
 */
export function getLargestCategory(
  breakdown: CategoryBreakdown,
): ActivityCategory | null {
  const entries = Object.entries(breakdown) as [ActivityCategory, number][];
  if (entries.length === 0) return null;

  const sorted = entries.sort(([, a], [, b]) => b - a);
  return sorted[0][1] > 0 ? sorted[0][0] : null;
}
