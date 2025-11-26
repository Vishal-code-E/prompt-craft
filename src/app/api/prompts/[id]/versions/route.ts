import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkWorkspaceAccess } from '@/lib/workspace';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/prompts/[id]/versions - Get prompt version history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promptId } = await params;
    const user = await getCurrentUser();

    // Get prompt to check workspace access
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { workspaceId: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check workspace access
    const hasAccess = await checkWorkspaceAccess(user.id, prompt.workspaceId);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get versions
    const versions = await prisma.promptVersion.findMany({
      where: { promptId },
      orderBy: { version: 'desc' },
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

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('GET /api/prompts/[id]/versions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}
