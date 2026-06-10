import { NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { successResponse } from "@/shared/types/api-response";
import { PrismaUserRepository } from "@/infrastructure/database/user-repository-impl";

const userRepo = new PrismaUserRepository();

/**
 * GET /api/user/export — Export all user data (GDPR Article 20).
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const data = await userRepo.exportData(auth.userId);

    return NextResponse.json(successResponse(data), {
      headers: {
        "Content-Disposition": `attachment; filename="carbonlens-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
