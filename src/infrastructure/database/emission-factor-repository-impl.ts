import { prisma } from "./prisma-client";
import type { EmissionFactorRepository } from "@/domain/repositories/emission-factor-repository";
import type { EmissionFactor } from "@/domain/entities/emission-factor";

/**
 * Prisma implementation of the EmissionFactorRepository port.
 * Emission factors are reference data that rarely change,
 * making them ideal for caching (see CacheAdapter).
 */
export class PrismaEmissionFactorRepository implements EmissionFactorRepository {
  async findById(id: string): Promise<EmissionFactor | null> {
    const record = await prisma.emissionFactor.findUnique({
      where: { id },
    });
    return record ? (record as EmissionFactor) : null;
  }

  async findByCategory(category: string, region = "global"): Promise<EmissionFactor[]> {
    const records = await prisma.emissionFactor.findMany({
      where: {
        category,
        region,
        validTo: null,
      },
      orderBy: { name: "asc" },
    });
    return records as EmissionFactor[];
  }

  async findByCategoryAndSubCategory(
    category: string,
    subCategory: string,
    region = "global",
  ): Promise<EmissionFactor | null> {
    const record = await prisma.emissionFactor.findFirst({
      where: {
        category,
        subCategory,
        region,
        validTo: null,
      },
    });
    return record ? (record as EmissionFactor) : null;
  }

  async findAll(): Promise<EmissionFactor[]> {
    const records = await prisma.emissionFactor.findMany({
      where: { validTo: null },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return records as EmissionFactor[];
  }
}
