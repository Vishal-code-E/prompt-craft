import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkWorkspaceAccess, MemberRole } from '@/lib/workspace';
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction } from '@/lib/audit';

/**
 * PATCH /api/prompts/[id] - Update prompt
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promptId } = await params;
    const user = await getCurrentUser();
    const body = await request.json();

    const { name, description, json, toon, tags } = body;

    // Get prompt with workspace check
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

    // Get current version number
    const versions = await prisma.promptVersion.findMany({
      where: { promptId },
      orderBy: { version: 'desc' },
      take: 1,
    });

    const nextVersion = versions.length > 0 ? versions[0].version + 1 : 1;

    // Update prompt and create version
    const [updatedPrompt] = await prisma.$transaction([
      prisma.prompt.update({
        where: { id: promptId },
        data: {
          name,
          description,
          json,
          toon,
          tags,
        },
        include: {
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.promptVersion.create({
        data: {
          promptId,
          version: nextVersion,
          json,
          toon,
          createdBy: user.id,
        },
      }),
    ]);

    // Audit log
    await createAuditLog({
      workspaceId: prompt.workspaceId,
      userId: user.id,
      action: AuditAction.PROMPT_UPDATED,
      metadata: {
        promptId,
        promptName: name,
        version: nextVersion,
      },
    });

    return NextResponse.json({ prompt: updatedPrompt });
  } catch (error) {
    console.error('PATCH /api/prompts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prompts/[id] - Delete prompt
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promptId } = await params;
    const user = await getCurrentUser();

    // Get prompt with workspace check
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
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

    // Only creator or admin/owner can delete
    const isCreator = prompt.createdBy === user.id;
    const isAdmin = await checkWorkspaceAccess(
      user.id,
      prompt.workspaceId,
      MemberRole.ADMIN
    );

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Only prompt creator or workspace admin can delete' },
        { status: 403 }
      );
    }

    // Delete prompt (cascades to versions)
    await prisma.prompt.delete({
      where: { id: promptId },
    });

    // Audit log
    await createAuditLog({
      workspaceId: prompt.workspaceId,
      userId: user.id,
      action: AuditAction.PROMPT_DELETED,
      metadata: {
        promptId,
        promptName: prompt.name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/prompts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/prompts/[id] - Get single prompt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promptId } = await params;
    const user = await getCurrentUser();

    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 5,
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

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check workspace access
    const hasAccess = await checkWorkspaceAccess(user.id, prompt.workspaceId);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('GET /api/prompts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}
