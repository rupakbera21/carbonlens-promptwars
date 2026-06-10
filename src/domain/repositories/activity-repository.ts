import type { Activity, CreateActivityInput } from "../entities/activity";

/**
 * Repository interface (port) for Activity persistence.
 * Infrastructure layer provides the implementation.
 */
export interface ActivityRepository {
  create(input: CreateActivityInput & { co2eKg: number }): Promise<Activity>;
  findById(id: string, userId: string): Promise<Activity | null>;
  findByUser(
    userId: string,
    options?: ActivityQueryOptions,
  ): Promise<PaginatedResult<Activity>>;
  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Activity[]>;
  delete(id: string, userId: string): Promise<boolean>;
  getWeeklyTotalByCategory(
    userId: string,
    category: string,
    weekStart: Date,
  ): Promise<number>;
  getMonthlyCountBySubCategory(
    userId: string,
    subCategory: string,
    monthStart: Date,
  ): Promise<number>;
}

export interface ActivityQueryOptions {
  cursor?: string;
  pageSize?: number;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}
