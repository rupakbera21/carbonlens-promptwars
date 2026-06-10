/**
 * Activity entity — represents a single carbon-producing action.
 * Pure domain object with no infrastructure dependencies.
 */
export interface Activity {
  readonly id: string;
  readonly userId: string;
  readonly category: ActivityCategory;
  readonly subCategory: string;
  readonly quantity: number;
  readonly unit: string;
  readonly co2eKg: number;
  readonly emissionFactorId: string;
  readonly activityDate: Date;
  readonly metadata: Record<string, unknown>;
  readonly synced: boolean;
  readonly createdAt: Date;
}

export type ActivityCategory = "transport" | "energy" | "food" | "shopping";

export const ACTIVITY_CATEGORIES: readonly ActivityCategory[] = [
  "transport",
  "energy",
  "food",
  "shopping",
] as const;

export interface CreateActivityInput {
  userId: string;
  category: ActivityCategory;
  subCategory: string;
  quantity: number;
  unit: string;
  emissionFactorId: string;
  activityDate: Date;
  metadata?: Record<string, unknown>;
}
