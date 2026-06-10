import { NextResponse } from "next/server";
import { successResponse } from "@/shared/types/api-response";

/**
 * GET /api/health — Health check endpoint for load balancers and monitoring.
 */
export async function GET() {
  return NextResponse.json(
    successResponse({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
    }),
  );
}
