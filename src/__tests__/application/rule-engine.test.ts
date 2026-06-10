import { describe, it, expect } from "vitest";
import { RuleEngine } from "@/application/rules/rule-engine";
import type { RuleCondition } from "@/application/rules/rule-types";

describe("RuleEngine", () => {
  const engine = new RuleEngine();

  describe("evaluate", () => {
    it("should return true when all conditions pass", () => {
      const conditions: RuleCondition[] = [
        { field: "category", operator: "equals", value: "transport" },
        { field: "weeklyTotal", operator: "greaterThan", value: 100 },
      ];
      const context = { category: "transport", weeklyTotal: 150 };

      expect(engine.evaluate(conditions, context)).toBe(true);
    });

    it("should return false when any condition fails", () => {
      const conditions: RuleCondition[] = [
        { field: "category", operator: "equals", value: "transport" },
        { field: "weeklyTotal", operator: "greaterThan", value: 100 },
      ];
      const context = { category: "transport", weeklyTotal: 50 };

      expect(engine.evaluate(conditions, context)).toBe(false);
    });

    it("should return true for empty conditions", () => {
      expect(engine.evaluate([], {})).toBe(true);
    });

    it("should handle 'in' operator", () => {
      const conditions: RuleCondition[] = [
        {
          field: "subCategory",
          operator: "in",
          value: ["car_petrol", "car_diesel"],
        },
      ];

      expect(
        engine.evaluate(conditions, { subCategory: "car_petrol" }),
      ).toBe(true);
      expect(
        engine.evaluate(conditions, { subCategory: "bus" }),
      ).toBe(false);
    });

    it("should handle 'notEquals' operator", () => {
      const conditions: RuleCondition[] = [
        { field: "status", operator: "notEquals", value: "completed" },
      ];

      expect(
        engine.evaluate(conditions, { status: "active" }),
      ).toBe(true);
      expect(
        engine.evaluate(conditions, { status: "completed" }),
      ).toBe(false);
    });

    it("should handle 'lessThan' operator", () => {
      const conditions: RuleCondition[] = [
        { field: "score", operator: "lessThan", value: 50 },
      ];

      expect(engine.evaluate(conditions, { score: 30 })).toBe(true);
      expect(engine.evaluate(conditions, { score: 50 })).toBe(false);
    });

    it("should handle 'contains' operator", () => {
      const conditions: RuleCondition[] = [
        { field: "name", operator: "contains", value: "car" },
      ];

      expect(engine.evaluate(conditions, { name: "electric car" })).toBe(true);
      expect(engine.evaluate(conditions, { name: "bus" })).toBe(false);
    });

    it("should handle missing context field gracefully", () => {
      const conditions: RuleCondition[] = [
        { field: "missing", operator: "equals", value: "test" },
      ];

      expect(engine.evaluate(conditions, {})).toBe(false);
    });

    it("should handle unknown operator gracefully", () => {
      const conditions: RuleCondition[] = [
        { field: "test", operator: "unknown" as any, value: "test" },
      ];

      expect(engine.evaluate(conditions, { test: "test" })).toBe(false);
    });
  });
});
