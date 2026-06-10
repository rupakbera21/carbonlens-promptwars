import { Activity } from "@/domain/entities/activity";
import { prisma } from "@/infrastructure/database/prisma-client";

export class GamificationEngineService {
  async processActivity(activity: Activity): Promise<void> {
    let phiImpact = 0;
    let xpAwarded = 0;

    // Baselines: Average daily CO2e footprint for typical actions (in kg)
    const baselines: Record<string, number> = {
      transport: 15, // E.g., average commute
      energy: 20,    // E.g., daily household energy
      food: 10,      // E.g., meat-heavy diet average
      waste: 5       // E.g., daily trash
    };

    const baseline = baselines[activity.category.toLowerCase()] || 10;
    
    // Difference: Positive means you saved carbon compared to average. Negative means excess pollution.
    const difference = baseline - activity.co2eKg;

    // Multiplier for RAPID progression so the user sees changes immediately
    const impactMultiplier = 2.0; 
    
    phiImpact = difference * impactMultiplier;
    
    // Cap extreme impacts per single activity so one flight doesn't drop score by -5000 instantly,
    // but still drops it by a massive amount like -50.
    phiImpact = Math.max(-60, Math.min(40, phiImpact));

    if (phiImpact > 0) {
      xpAwarded = Math.floor(phiImpact * 3);
    } else {
      xpAwarded = 0;
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
    const oldMilestone = Math.floor(oldPhi / 110);
    const newMilestone = Math.floor(newPhi / 110);
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
