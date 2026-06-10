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
    try {
      worldState = await prisma.worldState.findUnique({
        where: { userId: auth.userId },
      });
    } catch (dbError) {
      console.warn("Database unavailable, using mock world state.");
    }

    if (!worldState) {
      worldState = {
        id: "default-new",
        userId: auth.userId,
        ecoPoints: 0,
        phiScore: 50.0,
        forestHealth: 50.0,
        waterQuality: 50.0,
        airQuality: 50.0,
        biodiversity: 50.0,
        level: 1,
        updatedAt: new Date(),
      };
    }

    return NextResponse.json(successResponse(worldState));
  } catch (error) {
    return handleApiError(error);
  }
}
