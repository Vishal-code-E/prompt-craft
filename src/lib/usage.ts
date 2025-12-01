import { prisma } from '@/lib/prisma';
import { UsageType } from '@prisma/client';

/**
 * Calculate credit cost based on token usage
 * @param inputTokens Number of input tokens
 * @param outputTokens Number of output tokens
 * @returns Total credits required (1 credit per 1K input, 2 credits per 1K output)
 */
export function calculateCreditCost(
  inputTokens: number,
  outputTokens: number
): number {
  const inputCredits = Math.ceil(inputTokens / 1000);
  const outputCredits = Math.ceil(outputTokens / 500); // 2 credits per 1K = 1 credit per 500
  return inputCredits + outputCredits;
}

/**
 * Check if workspace has sufficient credits
 * @param workspaceId Workspace ID to check
 * @param requiredCredits Number of credits needed
 * @returns True if sufficient credits available
 */
export async function checkCredits(
  workspaceId: string,
  requiredCredits: number
): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { creditsRemaining: true },
  });

  if (!workspace) {
    return false;
  }

  return workspace.creditsRemaining >= requiredCredits;
}

/**
 * Log usage event and deduct credits atomically
 * @param data Usage event data
 * @returns Created usage event
 */
export async function logUsageAndDeductCredits(data: {
  workspaceId: string;
  userId: string;
  type: UsageType;
  inputTokens: number;
  outputTokens: number;
  latencyMs?: number;
  success?: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}) {
  const creditsUsed = calculateCreditCost(data.inputTokens, data.outputTokens);

  // Use transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    // Check and deduct credits
    const workspace = await tx.workspace.findUnique({
      where: { id: data.workspaceId },
      select: { creditsRemaining: true },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (workspace.creditsRemaining < creditsUsed) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits and increment monthly usage
    await tx.workspace.update({
      where: { id: data.workspaceId },
      data: {
        creditsRemaining: {
          decrement: creditsUsed,
        },
        creditsUsedMonthly: {
          increment: creditsUsed,
        },
        usageAlertSent: false, // Reset alert flag if credits were added
      },
    });

    // Create usage event
    const usageEvent = await tx.usageEvent.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        type: data.type,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        creditsUsed,
        latencyMs: data.latencyMs,
        success: data.success ?? true,
        errorMessage: data.errorMessage,
        metadata: data.metadata,
      },
    });

    return usageEvent;
  });
}

/**
 * Get workspace usage summary
 * @param workspaceId Workspace ID
 * @param days Number of days to look back (default: 30)
 * @returns Usage statistics
 */
export async function getWorkspaceUsageSummary(
  workspaceId: string,
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [events, totalStats] = await Promise.all([
    // Get all events in date range
    prisma.usageEvent.findMany({
      where: {
        workspaceId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    }),
    // Get aggregated stats
    prisma.usageEvent.aggregate({
      where: {
        workspaceId,
        createdAt: { gte: startDate },
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        creditsUsed: true,
      },
      _avg: {
        latencyMs: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  // Calculate stats by type
  const statsByType = events.reduce(
    (acc, event) => {
      const type = event.type;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          inputTokens: 0,
          outputTokens: 0,
          creditsUsed: 0,
        };
      }
      acc[type].count++;
      acc[type].inputTokens += event.inputTokens;
      acc[type].outputTokens += event.outputTokens;
      acc[type].creditsUsed += event.creditsUsed;
      return acc;
    },
    {} as Record<
      string,
      {
        count: number;
        inputTokens: number;
        outputTokens: number;
        creditsUsed: number;
      }
    >
  );

  // Calculate error rate
  const errorCount = events.filter((e) => !e.success).length;
  const errorRate = events.length > 0 ? errorCount / events.length : 0;

  // Group by day for trend data
  const dailyUsage = events.reduce(
    (acc, event) => {
      const date = event.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          creditsUsed: 0,
          inputTokens: 0,
          outputTokens: 0,
        };
      }
      acc[date].count++;
      acc[date].creditsUsed += event.creditsUsed;
      acc[date].inputTokens += event.inputTokens;
      acc[date].outputTokens += event.outputTokens;
      return acc;
    },
    {} as Record<
      string,
      {
        count: number;
        creditsUsed: number;
        inputTokens: number;
        outputTokens: number;
      }
    >
  );

  return {
    totalEvents: totalStats._count.id,
    totalInputTokens: totalStats._sum.inputTokens || 0,
    totalOutputTokens: totalStats._sum.outputTokens || 0,
    totalCreditsUsed: totalStats._sum.creditsUsed || 0,
    avgLatencyMs: Math.round(totalStats._avg.latencyMs || 0),
    errorRate,
    errorCount,
    statsByType,
    dailyUsage,
  };
}

/**
 * Get user-specific usage stats
 * @param workspaceId Workspace ID
 * @param userId User ID
 * @param days Number of days to look back (default: 30)
 * @returns User usage statistics
 */
export async function getUserUsageStats(
  workspaceId: string,
  userId: string,
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await prisma.usageEvent.aggregate({
    where: {
      workspaceId,
      userId,
      createdAt: { gte: startDate },
    },
    _sum: {
      inputTokens: true,
      outputTokens: true,
      creditsUsed: true,
    },
    _count: {
      id: true,
    },
  });

  const recentEvents = await prisma.usageEvent.findMany({
    where: {
      workspaceId,
      userId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'desc' },
    take: 20, // Last 20 events
  });

  return {
    totalEvents: stats._count.id,
    totalInputTokens: stats._sum.inputTokens || 0,
    totalOutputTokens: stats._sum.outputTokens || 0,
    totalCreditsUsed: stats._sum.creditsUsed || 0,
    recentEvents,
  };
}

/**
 * Clean up old usage events based on retention policy
 * @param retentionDays Number of days to retain (default: 90)
 * @returns Number of deleted events
 */
export async function cleanupOldUsageEvents(
  retentionDays: number = 90
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await prisma.usageEvent.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });

  return result.count;
}

/**
 * Check workspace credit threshold and return alert status
 * @param workspaceId Workspace ID
 * @returns Alert status with details
 */
export async function checkCreditAlertStatus(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      creditsRemaining: true,
      alertThreshold: true,
      usageAlertSent: true,
    },
  });

  if (!workspace) {
    return { shouldAlert: false, creditsRemaining: 0, threshold: 0 };
  }

  const shouldAlert =
    workspace.creditsRemaining <= workspace.alertThreshold &&
    !workspace.usageAlertSent;

  return {
    shouldAlert,
    creditsRemaining: workspace.creditsRemaining,
    threshold: workspace.alertThreshold,
    percentageRemaining: Math.round(
      (workspace.creditsRemaining / 1000) * 100
    ),
  };
}

/**
 * Mark alert as sent for workspace
 * @param workspaceId Workspace ID
 */
export async function markAlertSent(workspaceId: string) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { usageAlertSent: true },
  });
}

/**
 * Add credits to workspace (for purchases)
 * @param workspaceId Workspace ID
 * @param credits Number of credits to add
 * @returns Updated workspace
 */
export async function addCreditsToWorkspace(
  workspaceId: string,
  credits: number
) {
  return await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      creditsRemaining: {
        increment: credits,
      },
      usageAlertSent: false, // Reset alert flag
    },
  });
}

/**
 * Reset monthly usage counter (for subscription renewals)
 * @param workspaceId Workspace ID
 */
export async function resetMonthlyUsage(workspaceId: string) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      creditsUsedMonthly: 0,
      lastCreditReset: new Date(),
    },
  });
}
