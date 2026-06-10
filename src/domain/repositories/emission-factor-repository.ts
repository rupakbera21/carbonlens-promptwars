import type { EmissionFactor } from "../entities/emission-factor";

/**
 * Repository interface (port) for EmissionFactor lookup.
 */
export interface EmissionFactorRepository {
  findById(id: string): Promise<EmissionFactor | null>;
  findByCategory(category: string, region?: string): Promise<EmissionFactor[]>;
  findByCategoryAndSubCategory(
    category: string,
    subCategory: string,
    region?: string,
  ): Promise<EmissionFactor | null>;
  findAll(): Promise<EmissionFactor[]>;
}
