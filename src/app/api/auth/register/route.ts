import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { registerSchema } from "@/shared/schemas/user-schema";
import { PrismaUserRepository } from "@/infrastructure/database/user-repository-impl";
import { handleApiError, AppError } from "@/infrastructure/middleware/error-handler";
import { checkRateLimit } from "@/infrastructure/middleware/rate-limiter";
import { successResponse } from "@/shared/types/api-response";

const userRepo = new PrismaUserRepository();

/**
 * POST /api/auth/register — Create a new user account.
 * Rate limited to 5 requests/minute per IP to prevent abuse.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit registration endpoint more aggressively
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimited = checkRateLimit(`register:${ip}`, 5, 60000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const input = registerSchema.parse(body);

    // Check for existing user
    const existing = await userRepo.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }

    const passwordHash = await hash(input.password, 12);
    const user = await userRepo.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    return NextResponse.json(successResponse(user), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
