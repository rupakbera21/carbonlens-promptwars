import { describe, it, expect } from "vitest";
import {
  calculateScore,
  getLargestCategory,
  SCORE_THRESHOLDS,
} from "@/domain/value-objects/carbon-score";
import type { CategoryBreakdown } from "@/domain/value-objects/carbon-score";

describe("calculateScore", () => {
  it("should return 100 for 0 CO₂e", () => {
    expect(calculateScore(0)).toBe(100);
  });

  it("should return 0 for MAX_CO2E or above", () => {
    expect(calculateScore(SCORE_THRESHOLDS.MAX_CO2E_KG)).toBe(0);
    expect(calculateScore(300)).toBe(0);
  });

  it("should return 50 for half of MAX_CO2E", () => {
    expect(calculateScore(100)).toBe(50);
  });

  it("should return intermediate values", () => {
    const score = calculateScore(50);
    expect(score).toBe(75);
  });

  it("should never exceed 100", () => {
    expect(calculateScore(-10)).toBe(100);
  });

  it("should never go below 0", () => {
    expect(calculateScore(500)).toBe(0);
  });
});

describe("getLargestCategory", () => {
  it("should return the category with highest emissions", () => {
    const breakdown: CategoryBreakdown = {
      transport: 30,
      energy: 20,
      food: 50,
      shopping: 10,
    };
    expect(getLargestCategory(breakdown)).toBe("food");
  });

  it("should return null when all categories are 0", () => {
    const breakdown: CategoryBreakdown = {
      transport: 0,
      energy: 0,
      food: 0,
      shopping: 0,
    };
    expect(getLargestCategory(breakdown)).toBeNull();
  });

  it("should handle single non-zero category", () => {
    const breakdown: CategoryBreakdown = {
      transport: 10,
      energy: 0,
      food: 0,
      shopping: 0,
    };
    expect(getLargestCategory(breakdown)).toBe("transport");
  });

  it("should return null when breakdown has no entries", () => {
    expect(getLargestCategory({} as any)).toBeNull();
  });
});
