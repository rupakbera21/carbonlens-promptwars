import { prisma } from "./prisma-client";
import type {
  UserRepository,
  UserExportData,
} from "@/domain/repositories/user-repository";
import type {
  User,
  CreateUserInput,
  SafeUser,
} from "@/domain/entities/user";

/**
 * Prisma implementation of the UserRepository port.
 */
export class PrismaUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<SafeUser> {
    const record = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
        region: input.region ?? "global",
        timezone: input.timezone ?? "UTC",
      },
    });
    return this.toSafeDomain(record);
  }

  async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async update(
    id: string,
    data: Partial<Omit<User, "id" | "createdAt">>,
  ): Promise<SafeUser> {
    const record = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.region && { region: data.region }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.preferences && { preferences: data.preferences ?? {} }),
      },
    });
    return this.toSafeDomain(record);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /** GDPR hard delete — cascades to all related data */
  async hardDelete(id: string): Promise<void> {
    await prisma.$transaction([
      prisma.recommendation.deleteMany({ where: { userId: id } }),
      prisma.carbonScore.deleteMany({ where: { userId: id } }),
      prisma.goal.deleteMany({ where: { userId: id } }),
      prisma.activity.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
  }

  /** GDPR data export — returns all user data in a portable format */
  async exportData(id: string): Promise<UserExportData> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    const [activities, scores, goals, recommendations] = await Promise.all([
      prisma.activity.findMany({ where: { userId: id } }),
      prisma.carbonScore.findMany({ where: { userId: id } }),
      prisma.goal.findMany({ where: { userId: id } }),
      prisma.recommendation.findMany({ where: { userId: id } }),
    ]);

    return {
      user: this.toSafeDomain(user),
      activities,
      scores,
      goals,
      recommendations,
      exportedAt: new Date(),
    };
  }

  private toDomain(record: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    region: string;
    timezone: string;
    preferences: unknown;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): User {
    return {
      ...record,
      preferences: record.preferences as Record<string, unknown>,
    };
  }

  private toSafeDomain(record: {
    id: string;
    email: string;
    name: string;
    region: string;
    timezone: string;
    preferences: unknown;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): SafeUser {
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      region: record.region,
      timezone: record.timezone,
      preferences: record.preferences as Record<string, unknown>,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    };
  }
}
