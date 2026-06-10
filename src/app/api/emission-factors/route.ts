import { NextResponse } from "next/server";
import { handleApiError } from "@/infrastructure/middleware/error-handler";
import { successResponse } from "@/shared/types/api-response";
import { PrismaEmissionFactorRepository } from "@/infrastructure/database/emission-factor-repository-impl";

const emissionFactorRepo = new PrismaEmissionFactorRepository();

/**
 * GET /api/emission-factors — List all emission factors.
 * Public endpoint — needed for the activity form before auth.
 */
export async function GET() {
  try {
    const factors = await emissionFactorRepo.findAll();
    return NextResponse.json(successResponse(factors));
  } catch (error) {
    return handleApiError(error);
  }
}
