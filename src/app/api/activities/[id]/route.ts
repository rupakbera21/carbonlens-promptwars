import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { successResponse, errorResponse, ErrorCodes } from "@/shared/types/api-response";
import { ActivityService } from "@/application/services/activity-service";
import { PrismaActivityRepository } from "@/infrastructure/database/activity-repository-impl";
import { PrismaEmissionFactorRepository } from "@/infrastructure/database/emission-factor-repository-impl";

const activityRepo = new PrismaActivityRepository();
const emissionFactorRepo = new PrismaEmissionFactorRepository();
const activityService = new ActivityService(activityRepo, emissionFactorRepo);

/**
 * DELETE /api/activities/[id] — Delete a specific activity.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const deleted = await activityService.deleteActivity(id, auth.userId);

    if (!deleted) {
      return NextResponse.json(
        errorResponse([{ code: ErrorCodes.NOT_FOUND, message: "Activity not found" }]),
        { status: 404 },
      );
    }

    return NextResponse.json(successResponse({ deleted: true }));
  } catch (error) {
    return handleApiError(error);
  }
}
