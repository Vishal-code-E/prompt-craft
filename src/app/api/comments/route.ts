/**
 * Comments API Route
 * 
 * Handles CRUD operations for inline comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CommentLocationSchema = z.object({
    type: z.enum(['json', 'toon', 'rule']),
    path: z.string().optional(),
    line: z.number().optional(),
    nodeId: z.string().optional(),
    section: z.string().optional(),
});

const CreateCommentSchema = z.object({
    workspaceId: z.string(),
    promptId: z.string(),
    body: z.string().min(1),
    location: CommentLocationSchema,
    parentId: z.string().optional(),
    mentions: z.array(z.string()).optional(),
});

/**
 * GET /api/comments
 * Get all comments for a prompt
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const promptId = searchParams.get('promptId');

        if (!promptId) {
            return NextResponse.json({ error: 'promptId is required' }, { status: 400 });
        }

        // Verify user has access to the prompt's workspace
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

        // Get comments with user info and replies
        const comments = await prisma.comment.findMany({
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
                replies: {
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
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/comments
 * Create a new comment
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = CreateCommentSchema.parse(body);

        // Verify user has access to the workspace
        const workspace = await prisma.workspace.findFirst({
            where: {
                id: validatedData.workspaceId,
                members: {
                    some: { userId: session.user.id },
                },
            },
        });

        if (!workspace) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Create comment
        const comment = await prisma.comment.create({
            data: {
                workspaceId: validatedData.workspaceId,
                promptId: validatedData.promptId,
                userId: session.user.id,
                body: validatedData.body,
                location: validatedData.location,
                parentId: validatedData.parentId,
                mentions: validatedData.mentions || [],
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

        // Create audit log
        await prisma.auditLog.create({
            data: {
                workspaceId: validatedData.workspaceId,
                userId: session.user.id,
                action: 'COMMENT_ADDED',
                metadata: {
                    commentId: comment.id,
                    promptId: validatedData.promptId,
                    location: validatedData.location,
                },
            },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}
