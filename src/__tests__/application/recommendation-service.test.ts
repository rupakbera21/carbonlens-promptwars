import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecommendationService } from "../../application/services/recommendation-service";
import { ActivityRepository } from "../../domain/repositories/activity-repository";

// Mock Prisma
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    rule: {
      findMany: vi.fn(),
    },
    recommendation: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));
vi.mock("@/infrastructure/database/prisma-client", () => ({
  prisma: prismaMock,
}));

describe("RecommendationService", () => {
  let activityRepo: ReturnType<typeof vi.mocked<ActivityRepository>>;
  let service: RecommendationService;

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

    service = new RecommendationService(activityRepo);
    vi.clearAllMocks();
  });

  it("should generate recommendations and build rule context", async () => {
    prismaMock.rule.findMany.mockResolvedValue([
      {
        id: "r1",
        category: "transport",
        conditions: JSON.stringify([
          { field: "category", operator: "equals", value: "transport" },
          { field: "weeklyTotal", operator: "greaterThan", value: 10 },
        ]),
        actions: JSON.stringify([{ type: "recommend", params: { title: "Test 1" } }]),
      },
      {
        id: "r2",
        category: "food",
        conditions: JSON.stringify([
          { field: "subCategory", operator: "equals", value: "beef" },
          { field: "monthlyCount", operator: "greaterThan", value: 5 },
        ]),
        actions: JSON.stringify([{ type: "recommend", params: { title: "Test 2" } }]),
      },
      {
        id: "r3",
        category: "food",
        conditions: JSON.stringify([
          { field: "subCategory", operator: "in", value: ["beef", "lamb"] },
          { field: "monthlyCount", operator: "greaterThan", value: 5 },
        ]),
        actions: JSON.stringify([{ type: "recommend", params: { title: "Test 3" } }]),
      },
    ]);
    prismaMock.recommendation.findFirst.mockResolvedValue(null);
    prismaMock.recommendation.create.mockResolvedValue({ id: "rec1", title: "Test" });

    activityRepo.getWeeklyTotalByCategory.mockResolvedValue(20);
    activityRepo.getMonthlyCountBySubCategory.mockResolvedValue(10);

    const result = await service.generateRecommendations("u1");
    expect(prismaMock.rule.findMany).toHaveBeenCalled();
    expect(activityRepo.getWeeklyTotalByCategory).toHaveBeenCalled();
    expect(activityRepo.getMonthlyCountBySubCategory).toHaveBeenCalled();
    expect(prismaMock.recommendation.create).toHaveBeenCalled();
  });

  it("should get user recommendations", async () => {
    prismaMock.recommendation.findMany.mockResolvedValue([
      { id: "rec1", status: "active" },
    ]);
    const result = await service.getUserRecommendations("u1");
    expect(result.length).toBe(1);
    expect(prismaMock.recommendation.findMany).toHaveBeenCalled();
  });

  it("should dismiss recommendation", async () => {
    prismaMock.recommendation.updateMany.mockResolvedValue({ count: 1 });
    await service.dismissRecommendation("rec1", "u1");
    expect(prismaMock.recommendation.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "dismissed" }) }),
    );
  });

  it("should accept recommendation", async () => {
    prismaMock.recommendation.updateMany.mockResolvedValue({ count: 1 });
    await service.acceptRecommendation("rec1", "u1");
    expect(prismaMock.recommendation.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "accepted" } }),
    );
  });
});
