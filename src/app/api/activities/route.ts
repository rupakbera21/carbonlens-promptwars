import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import {
  createActivitySchema,
  activityQuerySchema,
} from "@/shared/schemas/activity-schema";
import { successResponse } from "@/shared/types/api-response";
import { ActivityService } from "@/application/services/activity-service";
import { ScoreService } from "@/application/services/score-service";
import { RecommendationService } from "@/application/services/recommendation-service";
import { PrismaActivityRepository } from "@/infrastructure/database/activity-repository-impl";
import { PrismaEmissionFactorRepository } from "@/infrastructure/database/emission-factor-repository-impl";
import { getWeekStart, getWeekEnd, getDayStart, getDayEnd, getHourStart, getHourEnd } from "@/shared/utils/date";

const activityRepo = new PrismaActivityRepository();
const emissionFactorRepo = new PrismaEmissionFactorRepository();
const activityService = new ActivityService(activityRepo, emissionFactorRepo);
const scoreService = new ScoreService(activityRepo);
const recommendationService = new RecommendationService(activityRepo);

/**
 * GET /api/activities — List user's activities (paginated).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = activityQuerySchema.parse(params);

    const result = await activityService.getUserActivities(auth.userId, query);

    return NextResponse.json(
      successResponse(result.data, {
        total: result.total,
        cursor: result.nextCursor,
        hasMore: result.nextCursor !== null,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/activities — Log a new activity.
 * After logging, triggers score recalculation and recommendation generation.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const input = createActivitySchema.parse(body);

    const activity = await activityService.logActivity({
      userId: auth.userId,
      ...input,
    });

    // Recalculate weekly, daily, and hourly score after logging
    const now = new Date();
    await Promise.all([
      scoreService.calculateAndStore(
        auth.userId,
        "weekly",
        getWeekStart(now),
        getWeekEnd(now),
      ),
      scoreService.calculateAndStore(
        auth.userId,
        "daily",
        getDayStart(now),
        getDayEnd(now),
      ),
      scoreService.calculateAndStore(
        auth.userId,
        "hourly",
        getHourStart(now),
        getHourEnd(now),
      ),
    ]);

    // Generate recommendations asynchronously (fire-and-forget)
    recommendationService
      .generateRecommendations(auth.userId)
      .catch((err) => console.error("Recommendation generation failed:", err));

    return NextResponse.json(successResponse(activity), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
