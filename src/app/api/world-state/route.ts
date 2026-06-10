import { NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { prisma } from "@/infrastructure/database/prisma-client";
import { successResponse } from "@/shared/types/api-response";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    let worldState = null;
    let achievements: any[] = [];
    try {
      worldState = await prisma.worldState.findUnique({
        where: { userId: auth.userId },
      });
      achievements = await prisma.userAchievement.findMany({
        where: { userId: auth.userId },
        orderBy: { unlockedAt: 'desc' }
      });
    } catch (dbError) {
      console.warn("Database unavailable, using mock world state.");
    }

    if (!worldState) {
      worldState = {
        id: "default-new",
        userId: auth.userId,
        ecoPoints: 0,
        phiScore: 0.0,
        forestHealth: 0.0,
        waterQuality: 0.0,
        airQuality: 0.0,
        biodiversity: 0.0,
        level: 1,
        updatedAt: new Date(),
      };
    }

    return NextResponse.json(successResponse({ ...worldState, achievements }));
  } catch (error) {
    return handleApiError(error);
  }
}
