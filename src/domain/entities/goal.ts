/**
 * Goal entity — a user-defined carbon reduction target.
 */
export interface Goal {
  readonly id: string;
  readonly userId: string;
  readonly targetCo2eKg: number;
  readonly periodType: GoalPeriodType;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly status: GoalStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type GoalPeriodType = "weekly" | "monthly";
export type GoalStatus = "active" | "completed" | "missed" | "cancelled";

export interface CreateGoalInput {
  userId: string;
  targetCo2eKg: number;
  periodType: GoalPeriodType;
  startDate: Date;
  endDate: Date;
}
