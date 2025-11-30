/**
 * Collaboration History API Route
 * 
 * Retrieves the history of collaborative changes for a prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/collaboration/history
 * Get collaboration history for a prompt
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const promptId = searchParams.get('promptId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (!promptId) {
            return NextResponse.json({ error: 'promptId is required' }, { status: 400 });
        }

        // Verify user has access to the prompt
        const prompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            include: {
                workspace: {
                    include: {
                        members: {
                            where: { userId: session.user.id },
                        },
                    },
                },
            },
        });

        if (!prompt || prompt.workspace.members.length === 0) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get collaboration history
        const history = await prisma.collaborationHistory.findMany({
            where: { promptId },
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
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        // Get total count
        const total = await prisma.collaborationHistory.count({
            where: { promptId },
        });

        return NextResponse.json({
            history,
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Error fetching collaboration history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch collaboration history' },
            { status: 500 }
        );
    }
}
