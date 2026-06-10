import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { successResponse } from "@/shared/types/api-response";
import { RecommendationService } from "@/application/services/recommendation-service";
import { PrismaActivityRepository } from "@/infrastructure/database/activity-repository-impl";

const activityRepo = new PrismaActivityRepository();
const recommendationService = new RecommendationService(activityRepo);

/**
 * GET /api/recommendations — Get personalized recommendations.
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const recs = await recommendationService.getUserRecommendations(auth.userId);
    return NextResponse.json(successResponse(recs));
  } catch (error) {
    return handleApiError(error);
  }
}
