import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

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
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this workspace' },
        { status: 403 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        creditsRemaining: true,
        creditsUsedMonthly: true,
        autoRefill: true,
        alertThreshold: true,
        lastCreditReset: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Calculate percentage remaining
    const percentageRemaining = Math.round(
      (workspace.creditsRemaining / 1000) * 100
    );

    // Determine alert status
    const isLowCredit = workspace.creditsRemaining <= workspace.alertThreshold;

    return NextResponse.json({
      creditsRemaining: workspace.creditsRemaining,
      creditsUsedMonthly: workspace.creditsUsedMonthly,
      autoRefill: workspace.autoRefill,
      alertThreshold: workspace.alertThreshold,
      percentageRemaining,
      isLowCredit,
      lastCreditReset: workspace.lastCreditReset,
    });
  } catch (error: unknown) {
    console.error('Error fetching credit summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit summary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
