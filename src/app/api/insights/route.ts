import { NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { successResponse } from "@/shared/types/api-response";
import { InsightService } from "@/application/services/insight-service";
import { PrismaActivityRepository } from "@/infrastructure/database/activity-repository-impl";

const activityRepo = new PrismaActivityRepository();
const insightService = new InsightService(activityRepo);

/**
 * GET /api/insights — Get trends, breakdowns, and savings opportunities.
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const insights = await insightService.getInsights(auth.userId);
    return NextResponse.json(successResponse(insights));
  } catch (error) {
    return handleApiError(error);
  }
}
