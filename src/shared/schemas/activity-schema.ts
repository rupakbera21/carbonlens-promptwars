import { z } from "zod";

/** Validation schema for creating a new activity */
export const createActivitySchema = z.object({
  category: z.enum(["transport", "energy", "food", "shopping"], {
    required_error: "Category is required",
  }),
  subCategory: z
    .string()
    .min(1, "Sub-category is required")
    .max(100, "Sub-category must be under 100 characters"),
  quantity: z
    .number()
    .positive("Quantity must be positive")
    .max(100_000, "Quantity exceeds maximum allowed value"),
  unit: z.string().min(1).max(30),
  emissionFactorId: z.string().uuid("Invalid emission factor ID"),
  activityDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
    .transform((val) => new Date(val)),
  metadata: z.record(z.unknown()).optional().default({}),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;

/** Validation schema for activity query parameters */
export const activityQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  pageSize: z.coerce.number().int().min(1).max(1000).optional().default(20),
  category: z.enum(["transport", "energy", "food", "shopping"]).optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
    .transform((val) => new Date(val))
    .optional(),
});

export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
