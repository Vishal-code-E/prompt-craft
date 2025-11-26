import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkWorkspaceAccess, MemberRole } from '@/lib/workspace';
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction } from '@/lib/audit';

/**
 * GET /api/workspaces/[id]/members - List workspace members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;
    const user = await getCurrentUser();

    const hasAccess = await checkWorkspaceAccess(user.id, workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
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
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const members = [
      {
        id: workspace.owner.id,
        name: workspace.owner.name,
        email: workspace.owner.email,
        image: workspace.owner.image,
        role: 'OWNER',
        joinedAt: workspace.createdAt,
      },
      ...workspace.members.map((member: { user: { id: string; name: string | null; email: string; image: string | null }; role: string; joinedAt: Date }) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
    ];

    return NextResponse.json({ members });
  } catch (error) {
    console.error('GET /api/workspaces/[id]/members error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces/[id]/members - Invite member to workspace
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;
    const user = await getCurrentUser();
    const body = await request.json();
    const { email, role = 'MEMBER' } = body;

    // Check if user is OWNER or ADMIN
    const hasAccess = await checkWorkspaceAccess(user.id, workspaceId, MemberRole.ADMIN);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: 'User not found. They must sign up first.' },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: invitedUser.id,
          workspaceId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: invitedUser.id,
        workspaceId,
        role,
      },
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
    });

    await createAuditLog({
      workspaceId,
      userId: user.id,
      action: AuditAction.WORKSPACE_MEMBER_ADDED,
      metadata: {
        invitedUserId: invitedUser.id,
        invitedUserEmail: email,
        role,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('POST /api/workspaces/[id]/members error:', error);
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces/[id]/members - Remove member from workspace
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if user is OWNER or ADMIN
    const hasAccess = await checkWorkspaceAccess(user.id, workspaceId, MemberRole.ADMIN);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Can't remove workspace owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (workspace?.ownerId === userId) {
      return NextResponse.json(
        { error: 'Cannot remove workspace owner' },
        { status: 400 }
      );
    }

    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    await createAuditLog({
      workspaceId,
      userId: user.id,
      action: AuditAction.WORKSPACE_MEMBER_REMOVED,
      metadata: { removedUserId: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/workspaces/[id]/members error:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
