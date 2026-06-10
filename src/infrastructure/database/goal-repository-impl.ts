import { prisma } from "./prisma-client";
import type { GoalRepository } from "@/domain/repositories/goal-repository";
import type { Goal, CreateGoalInput, GoalStatus } from "@/domain/entities/goal";

/**
 * Prisma implementation of the GoalRepository port.
 */
export class PrismaGoalRepository implements GoalRepository {
  async create(input: CreateGoalInput): Promise<Goal> {
    const record = await prisma.goal.create({
      data: {
        userId: input.userId,
        targetCo2eKg: input.targetCo2eKg,
        periodType: input.periodType,
        startDate: input.startDate,
        endDate: input.endDate,
      },
    });
    return record as Goal;
  }

  async findById(id: string, userId: string): Promise<Goal | null> {
    const record = await prisma.goal.findFirst({
      where: { id, userId },
    });
    return record ? (record as Goal) : null;
  }

  async findByUser(userId: string, status?: GoalStatus): Promise<Goal[]> {
    const records = await prisma.goal.findMany({
      where: { userId, ...(status && { status }) },
      orderBy: { startDate: "desc" },
    });
    return records as Goal[];
  }

  async update(id: string, userId: string, data: Partial<Goal>): Promise<Goal> {
    const record = await prisma.goal.updateMany({
      where: { id, userId },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.targetCo2eKg && { targetCo2eKg: data.targetCo2eKg }),
      },
    });

    if (record.count === 0) {
      throw new Error("Goal not found or unauthorized");
    }

    const updated = await prisma.goal.findUniqueOrThrow({ where: { id } });
    return updated as Goal;
  }

  async findActiveGoal(userId: string): Promise<Goal | null> {
    const record = await prisma.goal.findFirst({
      where: { userId, status: "active" },
      orderBy: { startDate: "desc" },
    });
    return record ? (record as Goal) : null;
  }
}
