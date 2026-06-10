import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { updateGoalSchema } from "@/shared/schemas/goal-schema";
import { successResponse, errorResponse, ErrorCodes } from "@/shared/types/api-response";
import { GoalService } from "@/application/services/goal-service";
import { PrismaGoalRepository } from "@/infrastructure/database/goal-repository-impl";

const goalRepo = new PrismaGoalRepository();
const goalService = new GoalService(goalRepo);

/**
 * PATCH /api/goals/[id] — Update goal status.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();
    const input = updateGoalSchema.parse(body);

    if (input.status) {
      const goal = await goalService.updateGoalStatus(id, auth.userId, input.status);
      return NextResponse.json(successResponse(goal));
    }

    return NextResponse.json(
      errorResponse([
        {
          code: ErrorCodes.VALIDATION_ERROR,
          message: "No valid update fields provided",
        },
      ]),
      { status: 400 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
