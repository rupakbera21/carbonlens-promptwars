import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/auth-options";
import { errorResponse, ErrorCodes } from "@/shared/types/api-response";

/**
 * Extract the authenticated user ID from the session.
 * Returns null and sends a 401 response if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  return userId ?? null;
}

/**
 * Guard function for API routes — returns 401 if not authenticated.
 */
export async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json(
      errorResponse([
        {
          code: ErrorCodes.UNAUTHORIZED,
          message: "Authentication required",
        },
      ]),
      { status: 401 },
    );
  }
  return { userId };
}
