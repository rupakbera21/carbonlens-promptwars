import type { ActivityRepository } from "@/domain/repositories/activity-repository";
import type { EmissionFactorRepository } from "@/domain/repositories/emission-factor-repository";
import type { Activity, CreateActivityInput } from "@/domain/entities/activity";
import type { PaginatedResult, ActivityQueryOptions } from "@/domain/repositories/activity-repository";
import { CarbonCalculator } from "@/domain/services/carbon-calculator";

/**
 * ActivityService — orchestrates activity logging with emission calculation.
 * Depends on repository interfaces (ports), not implementations.
 */
export class ActivityService {
  constructor(
    private readonly activityRepo: ActivityRepository,
    private readonly emissionFactorRepo: EmissionFactorRepository,
  ) {}

  async logActivity(input: CreateActivityInput): Promise<Activity> {
    const factor = await this.emissionFactorRepo.findById(
      input.emissionFactorId,
    );
    if (!factor) {
      throw new Error(`Emission factor not found: ${input.emissionFactorId}`);
    }

    const co2eKg = CarbonCalculator.calculate(input.quantity, factor);

    return this.activityRepo.create({
      ...input,
      co2eKg,
    });
  }

  async getUserActivities(
    userId: string,
    options?: ActivityQueryOptions,
  ): Promise<PaginatedResult<Activity>> {
    return this.activityRepo.findByUser(userId, options);
  }

  async deleteActivity(id: string, userId: string): Promise<boolean> {
    return this.activityRepo.delete(id, userId);
  }

  async getActivitiesForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Activity[]> {
    return this.activityRepo.findByUserAndDateRange(
      userId,
      startDate,
      endDate,
    );
  }
}
