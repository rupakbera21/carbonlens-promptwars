/**
 * User entity — core user identity and preferences.
 * Password hash is part of the entity but excluded from most projections.
 */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly name: string;
  readonly region: string;
  readonly timezone: string;
  readonly preferences: UserPreferences;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  highContrast?: boolean;
  reducedMotion?: boolean;
  units?: "metric" | "imperial";
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  region?: string;
  timezone?: string;
}

/** Projection of User without sensitive fields */
export type SafeUser = Omit<User, "passwordHash">;
