import { describe, it, expect, vi, beforeEach } from "vitest";
import { GamificationEngineService } from "../../application/services/gamification-engine";
import { Activity } from "../../domain/entities/activity";

// Mock Prisma
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    worldState: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/infrastructure/database/prisma-client", () => ({
  prisma: prismaMock,
}));

describe("GamificationEngineService", () => {
  let service: GamificationEngineService;

  beforeEach(() => {
    service = new GamificationEngineService();
    vi.clearAllMocks();
  });

  const createMockActivity = (co2eKg: number): Activity =>
    ({
      id: "act-1",
      userId: "user-1",
      category: "transport",
      subCategory: "car",
      quantity: 10,
      unit: "km",
      co2eKg,
      emissionFactorId: "ef-1",
      activityDate: new Date(),
      synced: true,
      metadata: {},
    }) as Activity;

  it("should create new WorldState if not exists and award positive impact", async () => {
    prismaMock.worldState.findUnique.mockResolvedValue(null);

    const activity = createMockActivity(2); // 15 - 2 = 13; 13 * 0.5 = 6.5 PHI and 19 XP
    await service.processActivity(activity);

    expect(prismaMock.worldState.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        ecoPoints: 19,
        phiScore: 106.5,
        forestHealth: 100.0,
        waterQuality: 100.0,
        airQuality: 100.0,
        biodiversity: 100.0,
      },
    });
  });

  it("should create new WorldState if not exists and give neutral impact", async () => {
    prismaMock.worldState.findUnique.mockResolvedValue(null);

    const activity = createMockActivity(15); // 15 - 15 = 0; 0 PHI and 0 XP
    await service.processActivity(activity);

    expect(prismaMock.worldState.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        ecoPoints: 0,
        phiScore: 100.0,
        forestHealth: 100.0,
        waterQuality: 100.0,
        airQuality: 100.0,
        biodiversity: 100.0,
      },
    });
  });

  it("should update existing WorldState and apply negative impact", async () => {
    prismaMock.worldState.findUnique.mockResolvedValue({
      id: "ws-1",
      ecoPoints: 100,
      phiScore: 50,
      forestHealth: 50,
      waterQuality: 50,
      airQuality: 50,
      biodiversity: 50,
    });

    const activity = createMockActivity(60); // 15 - 60 = -45; -45 * 0.5 = -22.5 PHI and 0 XP
    await service.processActivity(activity);

    expect(prismaMock.worldState.update).toHaveBeenCalledWith({
      where: { id: "ws-1" },
      data: {
        ecoPoints: 100, // +0
        phiScore: 27.5,
        forestHealth: 27.5,
        waterQuality: 27.5,
        airQuality: 27.5,
        biodiversity: 27.5,
      },
    });
  });

  it("should clamp values between 0 and 100", async () => {
    prismaMock.worldState.findUnique.mockResolvedValue({
      id: "ws-1",
      ecoPoints: 1000,
      phiScore: 99.8,
      forestHealth: 100, // Should stay 100
      waterQuality: 0,
      airQuality: 50,
      biodiversity: 50,
    });

    const activity = createMockActivity(1); // 15 - 1 = 14; 14 * 0.5 = 7 PHI; 7 * 3 = 21 XP
    await service.processActivity(activity);

    expect(prismaMock.worldState.update).toHaveBeenCalledWith({
      where: { id: "ws-1" },
      data: {
        ecoPoints: 1021,
        phiScore: 106.8, // Unbounded
        forestHealth: 100, // Clamped from 107
        waterQuality: 7.0, // Clamped from 7
        airQuality: 57.0, // Clamped from 57
        biodiversity: 57.0, // Clamped from 57
      },
    });
  });
});
