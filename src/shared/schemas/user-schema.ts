import { z } from "zod";

/** Validation schema for user registration */
export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be under 255 characters")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be under 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number",
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters")
    .trim(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** Validation schema for login */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Validation schema for updating user preferences */
export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  highContrast: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
  units: z.enum(["metric", "imperial"]).optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
