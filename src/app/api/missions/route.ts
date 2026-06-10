import { NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { prisma } from "@/infrastructure/database/prisma-client";
import { successResponse } from "@/shared/types/api-response";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    let missions = await prisma.userMission.findMany({
      where: { userId: auth.userId },
      orderBy: { updatedAt: "desc" },
    });

    if (missions.length === 0) {
      // Return dynamic/seeded mock missions if none exist to fulfill narrative aspect
      missions = [
        {
          id: "m1",
          userId: auth.userId,
          missionType: "Detect Emission Leak",
          progress: 50,
          completed: false,
          updatedAt: new Date(),
        },
        {
          id: "m2",
          userId: auth.userId,
          missionType: "Plant 5 Trees equivalent",
          progress: 100,
          completed: true,
          updatedAt: new Date(),
        },
      ] as any;
    }

    return NextResponse.json(successResponse(missions));
  } catch (error) {
    return handleApiError(error);
  }
}
