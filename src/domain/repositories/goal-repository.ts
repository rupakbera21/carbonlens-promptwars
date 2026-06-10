import type { Goal, CreateGoalInput, GoalStatus } from "../entities/goal";

/**
 * Repository interface (port) for Goal persistence.
 */
export interface GoalRepository {
  create(input: CreateGoalInput): Promise<Goal>;
  findById(id: string, userId: string): Promise<Goal | null>;
  findByUser(userId: string, status?: GoalStatus): Promise<Goal[]>;
  update(id: string, userId: string, data: Partial<Goal>): Promise<Goal>;
  findActiveGoal(userId: string): Promise<Goal | null>;
}
