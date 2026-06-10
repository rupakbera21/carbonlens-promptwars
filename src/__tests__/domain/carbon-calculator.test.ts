import { describe, it, expect } from "vitest";
import { CarbonCalculator } from "@/domain/services/carbon-calculator";
import type { EmissionFactor } from "@/domain/entities/emission-factor";

const createFactor = (factorKgCo2e: number): EmissionFactor => ({
  id: "test-id",
  category: "transport",
  subCategory: "car_petrol",
  name: "Test Factor",
  factorKgCo2e,
  unit: "km",
  source: "Test",
  region: "global",
  version: 1,
  validFrom: new Date(),
  validTo: null,
});

describe("CarbonCalculator", () => {
  describe("calculate", () => {
    it("should calculate CO₂e correctly for positive quantity", () => {
      const factor = createFactor(0.17);
      const result = CarbonCalculator.calculate(100, factor);
      expect(result).toBe(17);
    });

    it("should return 0 for zero quantity", () => {
      const factor = createFactor(0.17);
      const result = CarbonCalculator.calculate(0, factor);
      expect(result).toBe(0);
    });

    it("should throw for negative quantity", () => {
      const factor = createFactor(0.17);
      expect(() => CarbonCalculator.calculate(-10, factor)).toThrow(
        "Quantity cannot be negative",
      );
    });

    it("should round to 3 decimal places", () => {
      const factor = createFactor(0.17);
      const result = CarbonCalculator.calculate(33.333, factor);
      expect(result).toBe(5.667);
    });

    it("should return 0 for zero-emission factor", () => {
      const factor = createFactor(0);
      const result = CarbonCalculator.calculate(1000, factor);
      expect(result).toBe(0);
    });

    it("should handle large quantities", () => {
      const factor = createFactor(0.195);
      const result = CarbonCalculator.calculate(10000, factor);
      expect(result).toBe(1950);
    });
  });

  describe("sum", () => {
    it("should sum multiple CO₂e values", () => {
      const result = CarbonCalculator.sum([1.5, 2.3, 4.7]);
      expect(result).toBe(8.5);
    });

    it("should return 0 for empty array", () => {
      const result = CarbonCalculator.sum([]);
      expect(result).toBe(0);
    });
  });

  describe("annualToWeekly", () => {
    it("should convert annual to weekly correctly", () => {
      const result = CarbonCalculator.annualToWeekly(5200);
      expect(result).toBe(100);
    });
  });

  describe("formatCo2e", () => {
    it("should format small values as kg", () => {
      expect(CarbonCalculator.formatCo2e(50)).toBe("50.0 kg");
    });

    it("should format large values as tonnes", () => {
      expect(CarbonCalculator.formatCo2e(1500)).toBe("1.5 tonnes");
    });
  });
});
