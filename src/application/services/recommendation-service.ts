import { prisma } from "@/infrastructure/database/prisma-client";
import type { ActivityRepository } from "@/domain/repositories/activity-repository";
import type { Recommendation } from "@/domain/value-objects/recommendation";
import type { RuleDefinition, RuleOperator } from "../rules/rule-types";
import { RuleEngine } from "../rules/rule-engine";
import { getWeekStart, getMonthStart } from "@/shared/utils/date";

/**
 * RecommendationService — generates and manages personalized recommendations
 * using the configurable rule engine. NO hardcoded business logic.
 */
export class RecommendationService {
  private ruleEngine: RuleEngine;

  constructor(private readonly activityRepo: ActivityRepository) {
    this.ruleEngine = new RuleEngine();
  }

  /**
   * Evaluate all active rules against the user's recent activity
   * and generate new recommendations.
   */
  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    // Load active rules from database
    const rules = await prisma.rule.findMany({
      where: { active: true },
      orderBy: { priority: "desc" },
    });

    const now = new Date();
    const weekStart = getWeekStart(now);
    const monthStart = getMonthStart(now);

    const newRecommendations: Recommendation[] = [];

    for (const rule of rules) {
      const ruledef = rule;
      const conditions = JSON.parse(rule.conditions as string) as Array<{
        field: string;
        operator: RuleOperator;
        value: unknown;
      }>;

      // Build context for rule evaluation
      const context = await this.buildRuleContext(
        userId,
        conditions,
        weekStart,
        monthStart,
      );

      const shouldFire = this.ruleEngine.evaluate(conditions, context);

      if (shouldFire) {
        const actions = JSON.parse(rule.actions as string) as Array<{
          type: string;
          params: Record<string, unknown>;
        }>;

        for (const action of actions) {
          if (action.type === "recommend") {
            // Check if this recommendation already exists and is active
            const existing = await prisma.recommendation.findFirst({
              where: {
                userId,
                ruleId: rule.id,
                status: "active",
              },
            });

            if (!existing) {
              const rec = await prisma.recommendation.create({
                data: {
                  userId,
                  ruleId: rule.id,
                  category: rule.category,
                  title: action.params.title as string,
                  description: action.params.description as string,
                  potentialSavingKg: (action.params.potentialSavingKg as number) ?? 0,
                  priority: (action.params.priority as string) ?? "medium",
                },
              });
              newRecommendations.push(rec as unknown as Recommendation);
            }
          }
        }
      }
    }

    return newRecommendations;
  }

  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    const records = await prisma.recommendation.findMany({
      where: { userId, status: "active" },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return records as unknown as Recommendation[];
  }

  async dismissRecommendation(id: string, userId: string): Promise<void> {
    await prisma.recommendation.updateMany({
      where: { id, userId },
      data: { status: "dismissed", dismissedAt: new Date() },
    });
  }

  async acceptRecommendation(id: string, userId: string): Promise<void> {
    await prisma.recommendation.updateMany({
      where: { id, userId },
      data: { status: "accepted" },
    });
  }

  private async buildRuleContext(
    userId: string,
    conditions: Array<{ field: string; operator: string; value: unknown }>,
    weekStart: Date,
    monthStart: Date,
  ): Promise<Record<string, unknown>> {
    const context: Record<string, unknown> = {};

    // Extract what data the conditions need
    const needsWeeklyTotal = conditions.some((c) => c.field === "weeklyTotal");
    const needsMonthlyCount = conditions.some((c) => c.field === "monthlyCount");
    const categoryCondition = conditions.find((c) => c.field === "category");
    const subCategoryCondition = conditions.find((c) => c.field === "subCategory");

    if (categoryCondition) {
      context.category = categoryCondition.value;
    }
    if (subCategoryCondition) {
      context.subCategory = subCategoryCondition.value;
    }

    if (needsWeeklyTotal && categoryCondition) {
      context.weeklyTotal = await this.activityRepo.getWeeklyTotalByCategory(
        userId,
        categoryCondition.value as string,
        weekStart,
      );
    }

    if (needsMonthlyCount && subCategoryCondition) {
      const subCat = subCategoryCondition.value;
      const subCats = Array.isArray(subCat) ? subCat : [subCat];
      let totalCount = 0;
      for (const sc of subCats) {
        totalCount += await this.activityRepo.getMonthlyCountBySubCategory(
          userId,
          sc as string,
          monthStart,
        );
      }
      context.monthlyCount = totalCount;
    }

    return context;
  }
}
