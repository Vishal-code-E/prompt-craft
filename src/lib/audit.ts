import { prisma } from '@/lib/prisma';
import { AuditAction, Prisma } from '@prisma/client';
import { headers } from 'next/headers';

export { AuditAction };

interface AuditLogData {
  workspaceId: string;
  userId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await prisma.auditLog.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        action: data.action,
        metadata: (data.metadata || {}) as Prisma.InputJsonValue,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    
    console.error('Failed to create audit log:', error);
  }
}


export async function getWorkspaceAuditLogs(
  workspaceId: string,
  page: number = 1,
  pageSize: number = 50
) {
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({
      where: { workspaceId },
    }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
