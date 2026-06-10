import { Activity } from "@/domain/entities/activity";
import { prisma } from "@/infrastructure/database/prisma-client";

export class GamificationEngineService {
  async processActivity(activity: Activity): Promise<void> {
    let xpAwarded = 10;
    let phiImpact = 0;

    // A simplified XP / PHI logic based on carbon footprint.
    if (activity.co2eKg < 5) {
      xpAwarded = 50;
      phiImpact = 0.5;
    } else if (activity.co2eKg > 50) {
      xpAwarded = 0;
      phiImpact = -0.5;
    }

    const state = await prisma.worldState.findUnique({
      where: { userId: activity.userId },
    });

    if (!state) {
      await prisma.worldState.create({
        data: {
          userId: activity.userId,
          ecoPoints: xpAwarded,
          phiScore: this.clamp(50.0 + phiImpact),
          forestHealth: this.clamp(50.0 + phiImpact),
          waterQuality: this.clamp(50.0 + phiImpact),
          airQuality: this.clamp(50.0 + phiImpact),
          biodiversity: this.clamp(50.0 + phiImpact),
        },
      });
    } else {
      await prisma.worldState.update({
        where: { id: state.id },
        data: {
          ecoPoints: state.ecoPoints + xpAwarded,
          phiScore: this.clamp(state.phiScore + phiImpact),
          forestHealth: this.clamp(state.forestHealth + phiImpact),
          waterQuality: this.clamp(state.waterQuality + phiImpact),
          airQuality: this.clamp(state.airQuality + phiImpact),
          biodiversity: this.clamp(state.biodiversity + phiImpact),
        },
      });
    }
  }

  private clamp(value: number): number {
    return Math.min(100, Math.max(0, value));
  }
}
