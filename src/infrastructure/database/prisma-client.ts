import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client to prevent exhausting connections during development.
 * In production, Next.js hot-reloads would create new clients on each reload;
 * this pattern reuses the client from the global scope.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
