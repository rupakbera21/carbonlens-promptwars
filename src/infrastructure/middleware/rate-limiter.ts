import { NextResponse } from "next/server";
import { errorResponse, ErrorCodes } from "@/shared/types/api-response";

/**
 * Simple in-memory rate limiter using sliding window.
 * In production, replace with Redis-backed implementation.
 *
 * Design: Each IP gets a window with a counter and expiry.
 * When the counter exceeds the max, requests are rejected.
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

const DEFAULT_MAX =
  parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10) || 100;
const DEFAULT_WINDOW_MS =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10) || 60000;

/**
 * Check rate limit for a given key (typically IP address).
 * Returns null if allowed, or a NextResponse if rate limited.
 */
export function checkRateLimit(
  key: string,
  max = DEFAULT_MAX,
  windowMs = DEFAULT_WINDOW_MS,
): NextResponse | null {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > max) {
    return NextResponse.json(
      errorResponse([
        {
          code: ErrorCodes.RATE_LIMITED,
          message: "Too many requests. Please try again later.",
        },
      ]),
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((entry.resetTime - now) / 1000),
          ),
        },
      },
    );
  }

  return null;
}

// Periodic cleanup to prevent memory leaks
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000,
); // Clean every 5 minutes
