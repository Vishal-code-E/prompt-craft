import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getWorkspaceUsageSummary, getUserUsageStats } from '@/lib/usage';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing required parameter: workspaceId' },
        { status: 400 }
      );
    }

    // Check if user is a member of the workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this workspace' },
        { status: 403 }
      );
    }

    const isOwnerOrAdmin = ['OWNER', 'ADMIN'].includes(membership.role);

    // If userId is specified and user is not owner/admin, only allow viewing own stats
    if (userId && userId !== session.user.id && !isOwnerOrAdmin) {
      return NextResponse.json(
        { error: 'You can only view your own usage stats' },
        { status: 403 }
      );
    }

    // Get workspace info
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        creditsRemaining: true,
        creditsUsedMonthly: true,
        alertThreshold: true,
        autoRefill: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    let stats;

    if (userId) {
      // Get user-specific stats
      stats = await getUserUsageStats(workspaceId, userId, days);
    } else if (isOwnerOrAdmin) {
      // Get workspace-wide stats (only for owners/admins)
      stats = await getWorkspaceUsageSummary(workspaceId, days);
    } else {
      // Regular members can only see their own stats
      stats = await getUserUsageStats(workspaceId, session.user.id, days);
    }

    return NextResponse.json({
      workspace: {
        creditsRemaining: workspace.creditsRemaining,
        creditsUsedMonthly: workspace.creditsUsedMonthly,
        alertThreshold: workspace.alertThreshold,
        autoRefill: workspace.autoRefill,
      },
      stats,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching usage metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage metrics', details: error.message },
      { status: 500 }
    );
  }
}
