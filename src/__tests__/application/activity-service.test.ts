import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActivityService } from "../../application/services/activity-service";
import { ActivityRepository } from "../../domain/repositories/activity-repository";
import { EmissionFactorRepository } from "../../domain/repositories/emission-factor-repository";
import { CarbonCalculator } from "../../domain/services/carbon-calculator";
import { Activity } from "../../domain/entities/activity";
import { EmissionFactor } from "../../domain/entities/emission-factor";

describe("ActivityService", () => {
  let activityRepo: ReturnType<typeof vi.mocked<ActivityRepository>>;
  let efRepo: ReturnType<typeof vi.mocked<EmissionFactorRepository>>;
  let service: ActivityService;

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

    efRepo = {
      findById: vi.fn(),
      findByCategory: vi.fn(),
      findActiveByCategory: vi.fn(),
    } as any;

    service = new ActivityService(activityRepo, efRepo);

    vi.spyOn(CarbonCalculator, "calculate").mockReturnValue(1.7);
  });

  it("should log activity and calculate emissions", async () => {
    const input = {
      userId: "u1",
      category: "transport" as any,
      subCategory: "car_petrol",
      quantity: 10,
      unit: "km",
      emissionFactorId: "ef1",
      activityDate: new Date(),
    };

    const mockEF: EmissionFactor = {
      id: "ef1",
      category: "transport",
      subCategory: "car_petrol",
      name: "Petrol Car",
      factorKgCo2e: 0.17,
      unit: "km",
      source: "Test",
      region: "global",
      version: 1,
      validFrom: new Date(),
      validTo: null,
    };

    const mockActivity: Activity = {
      id: "a1",
      ...input,
      co2eKg: 1.7,
      metadata: {},
      synced: true,
      createdAt: new Date(),
    };

    efRepo.findById.mockResolvedValue(mockEF);
    activityRepo.create.mockResolvedValue(mockActivity);

    const result = await service.logActivity(input);

    expect(efRepo.findById).toHaveBeenCalledWith("ef1");
    expect(CarbonCalculator.calculate).toHaveBeenCalledWith(10, mockEF);
    expect(activityRepo.create).toHaveBeenCalledWith({ ...input, co2eKg: 1.7 });
    expect(result).toEqual(mockActivity);
  });

  it("should throw error if emission factor not found", async () => {
    efRepo.findById.mockResolvedValue(null);
    const input = {
      userId: "u1",
      category: "transport" as any,
      subCategory: "car_petrol",
      quantity: 10,
      unit: "km",
      emissionFactorId: "ef1",
      activityDate: new Date(),
    };

    await expect(service.logActivity(input)).rejects.toThrow("Emission factor not found");
  });

  it("should delete activity", async () => {
    activityRepo.delete.mockResolvedValue(true);
    const result = await service.deleteActivity("a1", "u1");
    expect(activityRepo.delete).toHaveBeenCalledWith("a1", "u1");
    expect(result).toBe(true);
  });

  it("should get user activities", async () => {
    const mockResult = { data: [], total: 0, nextCursor: null };
    activityRepo.findByUser.mockResolvedValue(mockResult);
    const result = await service.getUserActivities("u1", {});
    expect(activityRepo.findByUser).toHaveBeenCalledWith("u1", {});
    expect(result).toEqual(mockResult);
  });

  it("should get activities for period", async () => {
    activityRepo.findByUserAndDateRange.mockResolvedValue([]);
    const res = await service.getActivitiesForPeriod("u1", new Date(), new Date());
    expect(res).toEqual([]);
  });
});
