/**
 * EmissionFactor entity — reference data for CO₂e calculations.
 * Versioned and region-specific for reproducibility.
 */
export interface EmissionFactor {
  readonly id: string;
  readonly category: string;
  readonly subCategory: string;
  readonly name: string;
  readonly factorKgCo2e: number;
  readonly unit: string;
  readonly source: string;
  readonly region: string;
  readonly version: number;
  readonly validFrom: Date;
  readonly validTo: Date | null;
}
