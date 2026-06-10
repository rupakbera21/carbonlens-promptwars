import type { EmissionFactor } from "../entities/emission-factor";

/**
 * CarbonCalculator — pure domain service for computing CO₂e from activities.
 *
 * Formula: CO₂e (kg) = quantity × emission factor (kg CO₂e per unit)
 *
 * This is the ONLY place where emission calculations happen.
 * All factors are sourced from the EmissionFactor entity,
 * making every result fully traceable.
 */
export class CarbonCalculator {
  /**
   * Calculate CO₂e for an activity.
   * @param quantity - Amount of the activity (e.g., 50 km, 10 kWh)
   * @param factor - The emission factor to apply
   * @returns CO₂e in kilograms, rounded to 3 decimal places
   * @throws Error if quantity is negative
   */
  static calculate(quantity: number, factor: EmissionFactor): number {
    if (quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }

    const co2eKg = quantity * factor.factorKgCo2e;
    return Math.round(co2eKg * 1000) / 1000;
  }

  /**
   * Calculate total CO₂e from multiple activities.
   */
  static sum(co2eValues: number[]): number {
    const total = co2eValues.reduce((sum, val) => sum + val, 0);
    return Math.round(total * 1000) / 1000;
  }

  /**
   * Convert annual CO₂e to weekly for score calculation.
   */
  static annualToWeekly(annualKg: number): number {
    return Math.round((annualKg / 52) * 1000) / 1000;
  }

  /**
   * Convert kg CO₂e to a human-readable string.
   */
  static formatCo2e(kg: number): string {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)} tonnes`;
    }
    return `${kg.toFixed(1)} kg`;
  }
}
