import { describe, it, expect } from "vitest";
import { ScoreCalculator } from "@/domain/services/score-calculator";
import type { Activity } from "@/domain/entities/activity";

const createActivity = (category: Activity["category"], co2eKg: number): Activity => ({
  id: `test-${Math.random()}`,
  userId: "user-1",
  category,
  subCategory: "test",
  quantity: 10,
  unit: "km",
  co2eKg,
  emissionFactorId: "ef-1",
  activityDate: new Date(),
  metadata: {},
  synced: true,
  createdAt: new Date(),
});

describe("ScoreCalculator", () => {
  describe("compute", () => {
    it("should compute score and breakdown from activities", () => {
      const activities = [
        createActivity("transport", 15),
        createActivity("food", 10),
        createActivity("energy", 5),
      ];

      const result = ScoreCalculator.compute(activities);

      expect(result.breakdown.transport).toBe(15);
      expect(result.breakdown.food).toBe(10);
      expect(result.breakdown.energy).toBe(5);
      expect(result.breakdown.shopping).toBe(0);
      expect(result.totalCo2eKg).toBe(30);
      expect(result.score).toBe(85);
    });

    it("should return score 100 for empty activities", () => {
      const result = ScoreCalculator.compute([]);
      expect(result.score).toBe(100);
      expect(result.totalCo2eKg).toBe(0);
    });

    it("should handle multiple activities per category", () => {
      const activities = [
        createActivity("transport", 10),
        createActivity("transport", 20),
        createActivity("food", 5),
      ];

      const result = ScoreCalculator.compute(activities);
      expect(result.breakdown.transport).toBe(30);
      expect(result.breakdown.food).toBe(5);
    });
  });

  describe("explainScore", () => {
    it("should return excellent for score >= 90", () => {
      expect(ScoreCalculator.explainScore(95)).toContain("Excellent");
    });

    it("should return good for score >= 70", () => {
      expect(ScoreCalculator.explainScore(75)).toContain("Good");
    });

    it("should return average for score >= 50", () => {
      expect(ScoreCalculator.explainScore(55)).toContain("Average");
    });

    it("should return above average for score >= 30", () => {
      expect(ScoreCalculator.explainScore(35)).toContain("Above average");
    });

    it("should return high for score < 30", () => {
      expect(ScoreCalculator.explainScore(10)).toContain("High");
    });
  });
});
