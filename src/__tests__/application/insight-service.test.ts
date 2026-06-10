import { describe, it, expect, vi, beforeEach } from "vitest";
import { InsightService } from "../../application/services/insight-service";
import { ActivityRepository } from "../../domain/repositories/activity-repository";
import { ScoreCalculator } from "../../domain/services/score-calculator";

describe("InsightService", () => {
  let activityRepo: ReturnType<typeof vi.mocked<ActivityRepository>>;
  let service: InsightService;

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

    service = new InsightService(activityRepo);
  });

  it("should return empty insights if no activities exist", async () => {
    activityRepo.findByUserAndDateRange.mockResolvedValue([]);
    const result = await service.getInsights("u1");
    expect(result.largestCategory).toBeNull();
    expect(result.trends.length).toBe(8);
  });

  it("should generate user insights with activities", async () => {
    activityRepo.findByUserAndDateRange.mockResolvedValue([
      { co2eKg: 50, category: "transport" } as any,
      { co2eKg: 20, category: "food" } as any,
      { co2eKg: 15, category: "energy" } as any,
    ]);

    const result = await service.getInsights("u1");
    expect(result.largestCategory).toBe("transport");
    expect(result.currentWeek.totalCo2eKg).toBe(85);
    expect(result.savingsOpportunities.length).toBeGreaterThan(0);
  });
});
