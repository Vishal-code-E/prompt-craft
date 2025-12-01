import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId, autoRefill, alertThreshold } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing required field: workspaceId' },
        { status: 400 }
      );
    }

    // Check if user is owner or admin of workspace
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

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only workspace owners and admins can update credit settings' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};
    
    if (typeof autoRefill === 'boolean') {
      updateData.autoRefill = autoRefill;
    }
    
    if (typeof alertThreshold === 'number') {
      if (alertThreshold < 0 || alertThreshold > 10000) {
        return NextResponse.json(
          { error: 'Alert threshold must be between 0 and 10000' },
          { status: 400 }
        );
      }
      updateData.alertThreshold = alertThreshold;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update (autoRefill or alertThreshold)' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: updateData,
      select: {
        creditsRemaining: true,
        creditsUsedMonthly: true,
        autoRefill: true,
        alertThreshold: true,
      },
    });

    return NextResponse.json({
      success: true,
      workspace,
    });
  } catch (error: any) {
    console.error('Error updating credit settings:', error);
    return NextResponse.json(
      { error: 'Failed to update credit settings', details: error.message },
      { status: 500 }
    );
  }
}
