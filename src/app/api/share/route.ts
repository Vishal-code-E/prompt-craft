import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkWorkspaceAccess, MemberRole } from '@/lib/workspace';
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction } from '@/lib/audit';
import { nanoid } from 'nanoid';

/**
 * POST /api/share - Create public share link
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { promptId, expiresAt } = body;

    if (!promptId) {
      return NextResponse.json({ error: 'promptId is required' }, { status: 400 });
    }

    // Get prompt
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: { workspace: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check workspace access
    const hasAccess = await checkWorkspaceAccess(
      user.id,
      prompt.workspaceId,
      MemberRole.MEMBER
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate unique slug
    const slug = nanoid(12);

    // Create share
    const share = await prisma.publicPromptShare.create({
      data: {
        promptId,
        slug,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    // Audit log
    await createAuditLog({
      workspaceId: prompt.workspaceId,
      userId: user.id,
      action: AuditAction.PROMPT_SHARED,
      metadata: {
        promptId,
        promptName: prompt.name,
        shareId: share.id,
        slug,
      },
    });

    return NextResponse.json({ share });
  } catch (error) {
    console.error('POST /api/share error:', error);
    return NextResponse.json(
      { error: 'Failed to create share' },
      { status: 500 }
    );
  }
}
