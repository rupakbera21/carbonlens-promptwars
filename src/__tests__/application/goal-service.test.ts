import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoalService } from "../../application/services/goal-service";
import { GoalRepository } from "../../domain/repositories/goal-repository";
import { Goal } from "../../domain/entities/goal";

describe("GoalService", () => {
  let goalRepo: ReturnType<typeof vi.mocked<GoalRepository>>;
  let service: GoalService;

  beforeEach(() => {
    goalRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUser: vi.fn(),
      findActiveGoal: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    service = new GoalService(goalRepo);
  });

  it("should set a new goal and cancel existing active goals", async () => {
    const input = {
      userId: "u1",
      targetCo2eKg: 100,
      periodType: "monthly" as any,
      startDate: new Date(),
      endDate: new Date(),
    };

    const activeGoal: Goal = {
      id: "g1",
      ...input,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newGoal: Goal = {
      id: "g2",
      ...input,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    goalRepo.findActiveGoal.mockResolvedValue(activeGoal);
    goalRepo.create.mockResolvedValue(newGoal);

    const result = await service.createGoal(input);

    expect(goalRepo.findActiveGoal).toHaveBeenCalledWith("u1");
    expect(goalRepo.update).toHaveBeenCalledWith("g1", "u1", { status: "cancelled" });
    expect(goalRepo.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(newGoal);
  });

  it("should get active goal", async () => {
    const activeGoal: Goal = {
      id: "g1",
      userId: "u1",
      targetCo2eKg: 100,
      periodType: "monthly",
      startDate: new Date(),
      endDate: new Date(),
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    goalRepo.findActiveGoal.mockResolvedValue(activeGoal);

    const result = await service.getActiveGoal("u1");

    expect(result).toEqual(activeGoal);
  });

  it("should calculate progress", () => {
    expect(service.calculateProgress(50, 100)).toBe(50);
    expect(service.calculateProgress(150, 100)).toBe(-50);
  });

  it("should return 100 progress if targetCo2eKg is <= 0", () => {
    expect(service.calculateProgress(50, 0)).toBe(100);
    expect(service.calculateProgress(50, -10)).toBe(100);
  });

  it("should get user goals", async () => {
    goalRepo.findByUser.mockResolvedValue([]);
    const res = await service.getUserGoals("u1");
    expect(res).toEqual([]);
  });

  it("should update goal status", async () => {
    goalRepo.update.mockResolvedValue({} as any);
    await service.updateGoalStatus("g1", "u1", "completed");
    expect(goalRepo.update).toHaveBeenCalled();
  });
});
