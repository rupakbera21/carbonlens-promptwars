import type { GoalRepository } from "@/domain/repositories/goal-repository";
import type { Goal, CreateGoalInput, GoalStatus } from "@/domain/entities/goal";

/**
 * GoalService — manages carbon reduction goals.
 */
export class GoalService {
  constructor(private readonly goalRepo: GoalRepository) {}

  async createGoal(input: CreateGoalInput): Promise<Goal> {
    // Deactivate any existing active goal for this user
    const existingActive = await this.goalRepo.findActiveGoal(input.userId);
    if (existingActive) {
      await this.goalRepo.update(existingActive.id, input.userId, {
        status: "cancelled",
      });
    }

    return this.goalRepo.create(input);
  }

  async getUserGoals(userId: string, status?: GoalStatus): Promise<Goal[]> {
    return this.goalRepo.findByUser(userId, status);
  }

  async updateGoalStatus(id: string, userId: string, status: GoalStatus): Promise<Goal> {
    return this.goalRepo.update(id, userId, { status });
  }

  async getActiveGoal(userId: string): Promise<Goal | null> {
    return this.goalRepo.findActiveGoal(userId);
  }

  /**
   * Calculate progress toward the active goal.
   * Returns a percentage (0-100+) where >100 means target exceeded.
   */
  calculateProgress(currentCo2eKg: number, targetCo2eKg: number): number {
    if (targetCo2eKg <= 0) return 100;
    // For goals, lower CO₂e = better progress
    // 100% means at or below target
    const ratio = currentCo2eKg / targetCo2eKg;
    return Math.round((1 - Math.min(ratio, 2)) * 100);
  }
}
