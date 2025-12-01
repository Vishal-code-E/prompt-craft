import { prisma } from '@/lib/prisma';
import { UsageType, Prisma } from '@prisma/client';

export function calculateCreditCost(
    inputTokens: number,
    outputTokens: number
): number {
    const inputCredits = Math.ceil(inputTokens / 1000);
    const outputCredits = Math.ceil(outputTokens / 500);
    return inputCredits + outputCredits;
}

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

export async function logUsageAndDeductCredits(data: {
    workspaceId: string;
    userId: string;
    type: UsageType;
    inputTokens: number;
    outputTokens: number;
    latencyMs?: number;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
}) {
    const creditsUsed = calculateCreditCost(data.inputTokens, data.outputTokens);

    return await prisma.$transaction(async (tx) => {
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

        await tx.workspace.update({
            where: { id: data.workspaceId },
            data: {
                creditsRemaining: {
                    decrement: creditsUsed,
                },
                creditsUsedMonthly: {
                    increment: creditsUsed,
                },
                usageAlertSent: false,
            },
        });

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
                metadata: (data.metadata || {}) as Prisma.InputJsonValue,
            },
        });

        return usageEvent;
    });
}

export async function getWorkspaceUsageSummary(
    workspaceId: string,
    days: number = 30
) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [events, totalStats] = await Promise.all([
        prisma.usageEvent.findMany({
            where: {
                workspaceId,
                createdAt: { gte: startDate },
            },
            orderBy: { createdAt: 'desc' },
        }),
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

    const statsByType = events.reduce(
        (acc, event) => {
            const type = event.type as string;
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

    const errorCount = events.filter((e) => !e.success).length;
    const errorRate = events.length > 0 ? errorCount / events.length : 0;

    const dailyUsage = events.reduce(
        (acc, event) => {
            const date = event.createdAt instanceof Date
                ? event.createdAt.toISOString().split('T')[0]
                : new Date(event.createdAt).toISOString().split('T')[0];
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
        take: 20,
    });

    return {
        totalEvents: stats._count.id,
        totalInputTokens: stats._sum.inputTokens || 0,
        totalOutputTokens: stats._sum.outputTokens || 0,
        totalCreditsUsed: stats._sum.creditsUsed || 0,
        recentEvents,
    };
}

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
        percentageRemaining: workspace.creditsRemaining > 0
            ? Math.round((workspace.creditsRemaining / workspace.alertThreshold) * 100)
            : 0,
    };
}

export async function markAlertSent(workspaceId: string) {
    await prisma.workspace.update({
        where: { id: workspaceId },
        data: { usageAlertSent: true },
    });
}

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
            usageAlertSent: false,
        },
    });
}

export async function resetMonthlyUsage(workspaceId: string) {
    await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
            creditsUsedMonthly: 0,
            lastCreditReset: new Date(),
        },
    });
}
