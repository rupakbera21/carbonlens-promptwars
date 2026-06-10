/**
 * Recommendation value object — a personalized suggestion.
 */
export interface Recommendation {
  readonly id: string;
  readonly userId: string;
  readonly ruleId: string;
  readonly category: string;
  readonly title: string;
  readonly description: string;
  readonly potentialSavingKg: number;
  readonly priority: RecommendationPriority;
  readonly status: RecommendationStatus;
  readonly createdAt: Date;
  readonly dismissedAt: Date | null;
}

export type RecommendationPriority = "low" | "medium" | "high";
export type RecommendationStatus = "active" | "accepted" | "dismissed";
