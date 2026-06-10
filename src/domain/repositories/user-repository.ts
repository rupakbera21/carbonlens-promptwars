import type { User, CreateUserInput, SafeUser } from "../entities/user";

/**
 * Repository interface (port) for User persistence.
 */
export interface UserRepository {
  create(input: CreateUserInput): Promise<SafeUser>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<SafeUser>;
  softDelete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  exportData(id: string): Promise<UserExportData>;
}

export interface UserExportData {
  user: SafeUser;
  activities: unknown[];
  scores: unknown[];
  goals: unknown[];
  recommendations: unknown[];
  exportedAt: Date;
}
