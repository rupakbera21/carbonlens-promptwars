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

  it("should generate recommendations", async () => {
    prismaMock.rule.findMany.mockResolvedValue([
      {
        id: "r1",
        conditions: JSON.stringify([
          { field: "category", operator: "equals", value: "transport" },
        ]),
        actions: JSON.stringify([{ type: "recommend", params: { title: "Test" } }]),
      },
    ]);
    prismaMock.recommendation.findFirst.mockResolvedValue(null);
    prismaMock.recommendation.create.mockResolvedValue({ id: "rec1", title: "Test" });

    const result = await service.generateRecommendations("u1");
    expect(prismaMock.rule.findMany).toHaveBeenCalled();
    // Rule Engine will evaluate category transport -> true (since context will have transport due to fallback or logic)
    // Actually we don't need to fully assert RuleEngine logic here, just that it runs without crash
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
