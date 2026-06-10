import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { createGoalSchema, updateGoalSchema } from "@/shared/schemas/goal-schema";
import { successResponse } from "@/shared/types/api-response";
import { GoalService } from "@/application/services/goal-service";
import { PrismaGoalRepository } from "@/infrastructure/database/goal-repository-impl";

const goalRepo = new PrismaGoalRepository();
const goalService = new GoalService(goalRepo);

/**
 * GET /api/goals — List user's goals.
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const goals = await goalService.getUserGoals(auth.userId);
    return NextResponse.json(successResponse(goals));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/goals — Create a new goal.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const input = createGoalSchema.parse(body);

    const goal = await goalService.createGoal({
      userId: auth.userId,
      ...input,
    });

    return NextResponse.json(successResponse(goal), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
