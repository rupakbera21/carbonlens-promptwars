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

    const activity = createMockActivity(2); // < 5 gives +0.5 PHI and 50 XP
    await service.processActivity(activity);

    expect(prismaMock.worldState.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        ecoPoints: 50,
        phiScore: 50.5,
        forestHealth: 50.5,
        waterQuality: 50.5,
        airQuality: 50.5,
        biodiversity: 50.5,
      },
    });
  });

  it("should create new WorldState if not exists and give neutral impact", async () => {
    prismaMock.worldState.findUnique.mockResolvedValue(null);

    const activity = createMockActivity(20); // 10 XP, 0 PHI
    await service.processActivity(activity);

    expect(prismaMock.worldState.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        ecoPoints: 10,
        phiScore: 50,
        forestHealth: 50,
        waterQuality: 50,
        airQuality: 50,
        biodiversity: 50,
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

    const activity = createMockActivity(60); // > 50 gives -0.5 PHI and 0 XP
    await service.processActivity(activity);

    expect(prismaMock.worldState.update).toHaveBeenCalledWith({
      where: { id: "ws-1" },
      data: {
        ecoPoints: 100, // +0
        phiScore: 49.5,
        forestHealth: 49.5,
        waterQuality: 49.5,
        airQuality: 49.5,
        biodiversity: 49.5,
      },
    });
  });

  it("should clamp values between 0 and 100", async () => {
    prismaMock.worldState.findUnique.mockResolvedValue({
      id: "ws-1",
      ecoPoints: 1000,
      phiScore: 99.8,
      forestHealth: 100, // Should stay 100
      waterQuality: 0, // Should stay 0 if further reduced, but here we add 0.5
      airQuality: 50,
      biodiversity: 50,
    });

    const activity = createMockActivity(1); // +0.5 PHI
    await service.processActivity(activity);

    expect(prismaMock.worldState.update).toHaveBeenCalledWith({
      where: { id: "ws-1" },
      data: {
        ecoPoints: 1050,
        phiScore: 100, // Clamped from 100.3
        forestHealth: 100, // Clamped from 100.5
        waterQuality: 0.5,
        airQuality: 50.5,
        biodiversity: 50.5,
      },
    });
  });
});
