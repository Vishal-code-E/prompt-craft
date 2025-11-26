import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkWorkspaceAccess, checkPromptLimit, MemberRole } from '@/lib/workspace';
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction } from '@/lib/audit';

/**
 * GET /api/prompts - List prompts in workspace
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    const hasAccess = await checkWorkspaceAccess(user.id, workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      workspaceId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags) {
      where.tags = {
        hasSome: tags.split(','),
      };
    }

    const prompts = await prisma.prompt.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            versions: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('GET /api/prompts error:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

/**
 * POST /api/prompts - Create new prompt
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { workspaceId, name, description, json, toon, tags } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    if (!name || !json || !toon) {
      return NextResponse.json(
        { error: 'name, json, and toon are required' },
        { status: 400 }
      );
    }

    const hasAccess = await checkWorkspaceAccess(user.id, workspaceId, MemberRole.MEMBER);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check prompt limit
    const canCreate = await checkPromptLimit(workspaceId);
    if (!canCreate) {
      return NextResponse.json(
        { error: 'Prompt limit reached for your plan. Upgrade to create more prompts.' },
        { status: 403 }
      );
    }

    const prompt = await prisma.prompt.create({
      data: {
        workspaceId,
        name,
        description: description || null,
        json,
        toon,
        tags: tags || [],
        createdBy: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Create first version
    await prisma.promptVersion.create({
      data: {
        promptId: prompt.id,
        version: 1,
        json,
        toon,
        createdBy: user.id,
      },
    });

    await createAuditLog({
      workspaceId,
      userId: user.id,
      action: AuditAction.PROMPT_CREATED,
      metadata: {
        promptId: prompt.id,
        promptName: name,
      },
    });

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error('POST /api/prompts error:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}
