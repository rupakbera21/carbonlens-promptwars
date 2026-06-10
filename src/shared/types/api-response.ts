/**
 * Consistent API response type used across all endpoints.
 * Ensures predictable shape for frontend consumption.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  meta: ApiMeta;
  errors: ApiError[];
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
  cursor?: string | null;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

/** Helper to create a success response */
export function successResponse<T>(data: T, meta: ApiMeta = {}): ApiResponse<T> {
  return { success: true, data, meta, errors: [] };
}

/** Helper to create an error response */
export function errorResponse(errors: ApiError[], meta: ApiMeta = {}): ApiResponse<null> {
  return { success: false, data: null, meta, errors };
}

/** Common error codes */
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
