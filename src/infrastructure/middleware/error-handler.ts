import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { errorResponse, ErrorCodes } from "@/shared/types/api-response";

/**
 * Centralized error handler for API routes.
 * Converts known error types to appropriate HTTP responses.
 * Stack traces are never exposed to the client.
 */
export function handleApiError(error: unknown): NextResponse {
  // Zod validation errors → 400
  if (error instanceof ZodError) {
    return NextResponse.json(
      errorResponse(
        error.errors.map((e) => ({
          code: ErrorCodes.VALIDATION_ERROR,
          message: e.message,
          field: e.path.join("."),
        })),
      ),
      { status: 400 },
    );
  }

  // Known application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      errorResponse([{ code: error.code, message: error.message }]),
      { status: error.statusCode },
    );
  }

  // Unknown errors → 500 (log but don't expose)
  console.error("Unhandled API error:", error);
  return NextResponse.json(
    errorResponse([
      {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "An unexpected error occurred",
      },
    ]),
    { status: 500 },
  );
}

/**
 * Application error class with HTTP status code mapping.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AppError";
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(message, ErrorCodes.NOT_FOUND, 404);
  }

  static forbidden(message = "Access denied"): AppError {
    return new AppError(message, ErrorCodes.FORBIDDEN, 403);
  }

  static conflict(message = "Resource already exists"): AppError {
    return new AppError(message, ErrorCodes.CONFLICT, 409);
  }
}
