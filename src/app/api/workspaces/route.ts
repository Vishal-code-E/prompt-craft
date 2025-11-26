import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserWorkspaces } from '@/lib/workspace';
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction } from '@/lib/audit';

/**
 * GET /api/workspaces - List user's workspaces
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    const workspaces = await getUserWorkspaces(user.id);

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error('GET /api/workspaces error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces - Create a new workspace
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Workspace name is required' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        ownerId: user.id,
      },
    });

    // Create audit log
    await createAuditLog({
      workspaceId: workspace.id,
      userId: user.id,
      action: AuditAction.WORKSPACE_CREATED,
      metadata: { workspaceName: workspace.name },
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error('POST /api/workspaces error:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
