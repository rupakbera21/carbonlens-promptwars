import { prisma } from "./prisma-client";
import type {
  ActivityRepository,
  ActivityQueryOptions,
  PaginatedResult,
} from "@/domain/repositories/activity-repository";
import type { Activity, CreateActivityInput } from "@/domain/entities/activity";

/**
 * Prisma implementation of the ActivityRepository port.
 * All queries enforce user_id scoping for row-level security.
 */
export class PrismaActivityRepository implements ActivityRepository {
  async create(
    input: CreateActivityInput & { co2eKg: number },
  ): Promise<Activity> {
    const record = await prisma.activity.create({
      data: {
        userId: input.userId,
        category: input.category,
        subCategory: input.subCategory,
        quantity: input.quantity,
        unit: input.unit,
        co2eKg: input.co2eKg,
        emissionFactorId: input.emissionFactorId,
        activityDate: input.activityDate,
        metadata: input.metadata ?? {},
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string, userId: string): Promise<Activity | null> {
    const record = await prisma.activity.findFirst({
      where: { id, userId },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByUser(
    userId: string,
    options: ActivityQueryOptions = {},
  ): Promise<PaginatedResult<Activity>> {
    const pageSize = options.pageSize ?? 20;

    const where: Record<string, unknown> = { userId };
    if (options.category) where.category = options.category;
    if (options.startDate || options.endDate) {
      where.activityDate = {
        ...(options.startDate && { gte: options.startDate }),
        ...(options.endDate && { lte: options.endDate }),
      };
    }

    const [records, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        take: pageSize + 1,
        ...(options.cursor && {
          cursor: { id: options.cursor },
          skip: 1,
        }),
        orderBy: { activityDate: "desc" },
      }),
      prisma.activity.count({ where }),
    ]);

    const hasMore = records.length > pageSize;
    const data = hasMore ? records.slice(0, pageSize) : records;

    return {
      data: data.map(this.toDomain),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      total,
    };
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Activity[]> {
    const records = await prisma.activity.findMany({
      where: {
        userId,
        activityDate: { gte: startDate, lte: endDate },
      },
      orderBy: { activityDate: "desc" },
    });
    return records.map(this.toDomain);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.activity.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }

  async getWeeklyTotalByCategory(
    userId: string,
    category: string,
    weekStart: Date,
  ): Promise<number> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const result = await prisma.activity.aggregate({
      where: {
        userId,
        category,
        activityDate: { gte: weekStart, lt: weekEnd },
      },
      _sum: { quantity: true },
    });
    return result._sum.quantity ?? 0;
  }

  async getMonthlyCountBySubCategory(
    userId: string,
    subCategory: string,
    monthStart: Date,
  ): Promise<number> {
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    return prisma.activity.count({
      where: {
        userId,
        subCategory,
        activityDate: { gte: monthStart, lt: monthEnd },
      },
    });
  }

  private toDomain(record: {
    id: string;
    userId: string;
    category: string;
    subCategory: string;
    quantity: number;
    unit: string;
    co2eKg: number;
    emissionFactorId: string;
    activityDate: Date;
    metadata: unknown;
    synced: boolean;
    createdAt: Date;
  }): Activity {
    return {
      id: record.id,
      userId: record.userId,
      category: record.category as Activity["category"],
      subCategory: record.subCategory,
      quantity: record.quantity,
      unit: record.unit,
      co2eKg: record.co2eKg,
      emissionFactorId: record.emissionFactorId,
      activityDate: record.activityDate,
      metadata: record.metadata as Record<string, unknown>,
      synced: record.synced,
      createdAt: record.createdAt,
    };
  }
}
