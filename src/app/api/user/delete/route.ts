import { NextResponse } from "next/server";
import { requireAuth } from "@/infrastructure/middleware/auth-middleware";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { successResponse } from "@/shared/types/api-response";
import { PrismaUserRepository } from "@/infrastructure/database/user-repository-impl";

const userRepo = new PrismaUserRepository();

/**
 * DELETE /api/user/delete — Delete user account and all data (GDPR Article 17).
 * This is a hard delete with cascading removal of all related records.
 */
export async function DELETE() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    await userRepo.hardDelete(auth.userId);

    return NextResponse.json(
      successResponse({ deleted: true, message: "Account and all data permanently deleted" }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
