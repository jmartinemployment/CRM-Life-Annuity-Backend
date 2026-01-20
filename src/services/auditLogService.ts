import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  oldValues: Prisma.JsonValue | null;
  newValues: Prisma.JsonValue | null;
  createdAt: Date;
}

export interface AuditLogQueryParams {
  entityType?: string;
  entityId?: string;
  action?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'entityType' | 'action';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAuditLogs {
  data: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuditSummary {
  entityType: string;
  totalActions: number;
  creates: number;
  updates: number;
  deletes: number;
  lastActivity: Date | null;
}

export async function getAuditLogs(params: AuditLogQueryParams): Promise<PaginatedAuditLogs> {
  const {
    entityType,
    entityId,
    action,
    userId,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const where: Prisma.AuditLogWhereInput = {};

  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (action) where.action = action;
  if (userId) where.userId = userId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  if (search) {
    where.OR = [
      { entityType: { contains: search, mode: 'insensitive' } },
      { entityId: { contains: search, mode: 'insensitive' } },
      { action: { contains: search, mode: 'insensitive' } },
    ];
  }

  const total = await prisma.auditLog.count({ where });
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
  });

  const data: AuditLogEntry[] = [];

  for (const log of logs) {
    let userName: string | null = null;
    let userEmail: string | null = null;

    if (log.userId) {
      const user = await prisma.user.findUnique({
        where: { id: log.userId },
        select: { firstName: true, lastName: true, email: true },
      });
      if (user) {
        userName = `${user.firstName} ${user.lastName}`;
        userEmail = user.email;
      }
    }

    data.push({
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      userId: log.userId,
      userName,
      userEmail,
      oldValues: log.oldValues,
      newValues: log.newValues,
      createdAt: log.createdAt,
    });
  }

  return {
    data,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
}

export async function getAuditLogById(id: string): Promise<AuditLogEntry | null> {
  const log = await prisma.auditLog.findUnique({ where: { id } });
  if (!log) return null;

  let userName: string | null = null;
  let userEmail: string | null = null;

  if (log.userId) {
    const user = await prisma.user.findUnique({
      where: { id: log.userId },
      select: { firstName: true, lastName: true, email: true },
    });
    if (user) {
      userName = `${user.firstName} ${user.lastName}`;
      userEmail = user.email;
    }
  }

  return {
    id: log.id,
    entityType: log.entityType,
    entityId: log.entityId,
    action: log.action,
    userId: log.userId,
    userName,
    userEmail,
    oldValues: log.oldValues,
    newValues: log.newValues,
    createdAt: log.createdAt,
  };
}

export async function getEntityAuditHistory(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
  const logs = await prisma.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
  });

  const data: AuditLogEntry[] = [];

  for (const log of logs) {
    let userName: string | null = null;
    let userEmail: string | null = null;

    if (log.userId) {
      const user = await prisma.user.findUnique({
        where: { id: log.userId },
        select: { firstName: true, lastName: true, email: true },
      });
      if (user) {
        userName = `${user.firstName} ${user.lastName}`;
        userEmail = user.email;
      }
    }

    data.push({
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      userId: log.userId,
      userName,
      userEmail,
      oldValues: log.oldValues,
      newValues: log.newValues,
      createdAt: log.createdAt,
    });
  }

  return data;
}

export async function getAuditSummary(): Promise<AuditSummary[]> {
  const entityTypes = await prisma.auditLog.findMany({
    select: { entityType: true },
    distinct: ['entityType'],
  });

  const summaries: AuditSummary[] = [];

  for (const { entityType } of entityTypes) {
    const [total, creates, updates, deletes, lastLog] = await Promise.all([
      prisma.auditLog.count({ where: { entityType } }),
      prisma.auditLog.count({ where: { entityType, action: 'CREATE' } }),
      prisma.auditLog.count({ where: { entityType, action: 'UPDATE' } }),
      prisma.auditLog.count({ where: { entityType, action: 'DELETE' } }),
      prisma.auditLog.findFirst({
        where: { entityType },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    summaries.push({
      entityType,
      totalActions: total,
      creates,
      updates,
      deletes,
      lastActivity: lastLog?.createdAt || null,
    });
  }

  return summaries.sort((a, b) => b.totalActions - a.totalActions);
}

export async function getUserAuditHistory(userId: string, limit: number = 100): Promise<AuditLogEntry[]> {
  const logs = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true },
  });

  const userName = user ? `${user.firstName} ${user.lastName}` : null;
  const userEmail = user?.email || null;

  return logs.map((log) => ({
    id: log.id,
    entityType: log.entityType,
    entityId: log.entityId,
    action: log.action,
    userId: log.userId,
    userName,
    userEmail,
    oldValues: log.oldValues,
    newValues: log.newValues,
    createdAt: log.createdAt,
  }));
}

export async function getDistinctEntityTypes(): Promise<string[]> {
  const result = await prisma.auditLog.findMany({
    select: { entityType: true },
    distinct: ['entityType'],
    orderBy: { entityType: 'asc' },
  });
  return result.map((r) => r.entityType);
}

export async function getDistinctActions(): Promise<string[]> {
  const result = await prisma.auditLog.findMany({
    select: { action: true },
    distinct: ['action'],
    orderBy: { action: 'asc' },
  });
  return result.map((r) => r.action);
}

export async function purgeOldAuditLogs(daysToKeep: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: cutoffDate } },
  });

  return result.count;
}
