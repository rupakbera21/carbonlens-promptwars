import { z } from "zod";

/** Validation schema for creating a new goal */
export const createGoalSchema = z
  .object({
    targetCo2eKg: z
      .number()
      .positive("Target must be positive")
      .max(10_000, "Target exceeds maximum"),
    periodType: z.enum(["weekly", "monthly"], {
      required_error: "Period type is required",
    }),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
      .transform((val) => new Date(val)),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
      .transform((val) => new Date(val)),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

/** Validation schema for updating a goal */
export const updateGoalSchema = z.object({
  status: z
    .enum(["active", "completed", "missed", "cancelled"])
    .optional(),
  targetCo2eKg: z.number().positive().max(10_000).optional(),
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
