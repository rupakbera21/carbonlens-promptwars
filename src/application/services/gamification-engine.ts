import { Activity } from "@/domain/entities/activity";
import { prisma } from "@/infrastructure/database/prisma-client";

export class GamificationEngineService {
  async processActivity(activity: Activity): Promise<void> {
    let xpAwarded = 10;
    let phiImpact = 0;

    // A simplified XP / PHI logic based on carbon footprint.
    if (activity.co2eKg < 5) {
      xpAwarded = 50;
      phiImpact = 15.0; // Huge visual impact for the user
    } else if (activity.co2eKg > 50) {
      xpAwarded = 0;
      phiImpact = -15.0;
    }

    const state = await prisma.worldState.findUnique({
      where: { userId: activity.userId },
    });

    const oldPhi = state ? state.phiScore : 0.0;
    const newPhi = Math.max(0, oldPhi + phiImpact);

    if (!state) {
      await prisma.worldState.create({
        data: {
          userId: activity.userId,
          ecoPoints: xpAwarded,
          phiScore: newPhi,
          forestHealth: this.clamp(0.0 + phiImpact),
          waterQuality: this.clamp(0.0 + phiImpact),
          airQuality: this.clamp(0.0 + phiImpact),
          biodiversity: this.clamp(0.0 + phiImpact),
        },
      });
    } else {
      await prisma.worldState.update({
        where: { id: state.id },
        data: {
          ecoPoints: state.ecoPoints + xpAwarded,
          phiScore: newPhi,
          forestHealth: this.clamp(state.forestHealth + phiImpact),
          waterQuality: this.clamp(state.waterQuality + phiImpact),
          airQuality: this.clamp(state.airQuality + phiImpact),
          biodiversity: this.clamp(state.biodiversity + phiImpact),
        },
      });
    }

    // Award badges for progression milestones
    const oldMilestone = Math.floor(oldPhi / 100);
    const newMilestone = Math.floor(newPhi / 100);
    if (newMilestone > oldMilestone && newMilestone >= 1) {
      // Create achievement based on tier
      let achievementType = `Planet ${newMilestone + 1} Restored`;
      if (newMilestone === 1) achievementType = "Solar System Formed";
      if (newMilestone === 10) achievementType = "First Galaxy Unlocked";
      if (newMilestone > 10 && newMilestone % 10 === 0) achievementType = `Galaxy ${newMilestone / 10} Unlocked`;
      
      // Check if already awarded
      const existing = await prisma.userAchievement.findFirst({
        where: { userId: activity.userId, achievementType }
      });
      if (!existing) {
        await prisma.userAchievement.create({
          data: {
            userId: activity.userId,
            achievementType
          }
        });
      }
    }
  }

  private clamp(value: number): number {
    return Math.min(100, Math.max(0, value));
  }
}
