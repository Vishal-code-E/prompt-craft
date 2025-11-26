import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkWorkspaceAccess, MemberRole } from '@/lib/workspace';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/share/[id] - Deactivate share link
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareId } = await params;
    const user = await getCurrentUser();

    // Get share with prompt
    const share = await prisma.publicPromptShare.findUnique({
      where: { id: shareId },
      include: {
        prompt: true,
      },
    });

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // Check workspace access
    const hasAccess = await checkWorkspaceAccess(
      user.id,
      share.prompt.workspaceId,
      MemberRole.MEMBER
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Deactivate share
    await prisma.publicPromptShare.update({
      where: { id: shareId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/share/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate share' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/share/[id] - Get share details (for authenticated users)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareId } = await params;
    const user = await getCurrentUser();

    const share = await prisma.publicPromptShare.findUnique({
      where: { id: shareId },
      include: {
        prompt: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // Check workspace access
    const hasAccess = await checkWorkspaceAccess(
      user.id,
      share.prompt.workspaceId
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ share });
  } catch (error) {
    console.error('GET /api/share/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share' },
      { status: 500 }
    );
  }
}
