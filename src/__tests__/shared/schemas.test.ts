import { describe, it, expect } from "vitest";
import { createActivitySchema } from "@/shared/schemas/activity-schema";
import { registerSchema } from "@/shared/schemas/user-schema";
import { createGoalSchema } from "@/shared/schemas/goal-schema";

describe("Activity Schema", () => {
  it("should validate a correct activity input", () => {
    const input = {
      category: "transport",
      subCategory: "car_petrol",
      quantity: 50,
      unit: "km",
      emissionFactorId: "a0000001-0000-0000-0000-000000000001",
      activityDate: "2024-01-15",
    };

    const result = createActivitySchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("should reject negative quantity", () => {
    const input = {
      category: "transport",
      subCategory: "car_petrol",
      quantity: -10,
      unit: "km",
      emissionFactorId: "a0000001-0000-0000-0000-000000000001",
      activityDate: "2024-01-15",
    };

    const result = createActivitySchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("should reject invalid category", () => {
    const input = {
      category: "invalid",
      subCategory: "test",
      quantity: 10,
      unit: "km",
      emissionFactorId: "a0000001-0000-0000-0000-000000000001",
      activityDate: "2024-01-15",
    };

    const result = createActivitySchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("should reject quantity exceeding max", () => {
    const input = {
      category: "transport",
      subCategory: "car_petrol",
      quantity: 200_000,
      unit: "km",
      emissionFactorId: "a0000001-0000-0000-0000-000000000001",
      activityDate: "2024-01-15",
    };

    const result = createActivitySchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("Register Schema", () => {
  it("should validate correct registration input", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Test1234!",
      name: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("should reject weak password (no uppercase)", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "test1234",
      name: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Te1!",
      name: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "Test1234!",
      name: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("should normalize email to lowercase", () => {
    const result = registerSchema.safeParse({
      email: "TEST@Example.COM",
      password: "Test1234!",
      name: "Test User",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });
});

describe("Goal Schema", () => {
  it("should validate correct goal input", () => {
    const result = createGoalSchema.safeParse({
      targetCo2eKg: 50,
      periodType: "weekly",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    });
    expect(result.success).toBe(true);
  });

  it("should reject endDate before startDate", () => {
    const result = createGoalSchema.safeParse({
      targetCo2eKg: 50,
      periodType: "weekly",
      startDate: "2024-01-31",
      endDate: "2024-01-01",
    });
    expect(result.success).toBe(false);
  });
});
