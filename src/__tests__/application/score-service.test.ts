import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScoreService } from "../../application/services/score-service";
import { ActivityRepository } from "../../domain/repositories/activity-repository";
import { ScoreCalculator } from "../../domain/services/score-calculator";

// Mock Prisma
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    carbonScore: {
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));
vi.mock("@/infrastructure/database/prisma-client", () => ({
  prisma: prismaMock,
}));

describe("ScoreService", () => {
  let activityRepo: ReturnType<typeof vi.mocked<ActivityRepository>>;
  let service: ScoreService;

  beforeEach(() => {
    activityRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUser: vi.fn(),
      findByUserAndDateRange: vi.fn(),
      delete: vi.fn(),
      getWeeklyTotalByCategory: vi.fn(),
      getMonthlyCountBySubCategory: vi.fn(),
    } as any;

    service = new ScoreService(activityRepo);
    vi.clearAllMocks();
  });

  it("should calculate and store score", async () => {
    activityRepo.findByUserAndDateRange.mockResolvedValue([
      { co2eKg: 10, category: "transport" } as any,
    ]);

    prismaMock.carbonScore.findFirst.mockResolvedValue(null);
    prismaMock.carbonScore.create.mockResolvedValue({
      id: "s1",
      score: 95,
      totalCo2eKg: 10,
      breakdown: { transport: 10 },
    });

    const result = await service.calculateAndStore(
      "u1",
      "weekly",
      new Date(),
      new Date(),
    );

    expect(result.score).toBe(95);
    expect(prismaMock.carbonScore.create).toHaveBeenCalled();
  });

  it("should get current score", async () => {
    prismaMock.carbonScore.findFirst.mockResolvedValue({ id: "s1", score: 90 });
    const result = await service.getCurrentScore("u1");
    expect(result?.score).toBe(90);
  });

  it("should return null if no current score", async () => {
    prismaMock.carbonScore.findFirst.mockResolvedValue(null);
    const result = await service.getCurrentScore("u1");
    expect(result).toBeNull();
  });

  it("should update existing score during calculateAndStore", async () => {
    activityRepo.findByUserAndDateRange.mockResolvedValue([]);
    prismaMock.carbonScore.findFirst.mockResolvedValue({ id: "existing-id" });
    prismaMock.carbonScore.update.mockResolvedValue({
      id: "existing-id",
      score: 100,
      totalCo2eKg: 0,
      breakdown: { transport: 0 },
    });

    const result = await service.calculateAndStore(
      "u1",
      "weekly",
      new Date(),
      new Date(),
    );
    expect(result.id).toBe("existing-id");
    expect(prismaMock.carbonScore.findFirst).toHaveBeenCalled();
    expect(prismaMock.carbonScore.update).toHaveBeenCalled();
  });

  it("should get score history", async () => {
    prismaMock.carbonScore.findMany.mockResolvedValue([{ id: "s1", score: 80 }]);
    const result = await service.getScoreHistory("u1", "monthly");
    expect(result.length).toBe(1);
    expect(result[0].score).toBe(80);
  });
});
