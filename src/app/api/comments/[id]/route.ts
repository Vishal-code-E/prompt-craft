/**
 * Individual Comment API Route
 * 
 * Handles update and delete operations for specific comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateCommentSchema = z.object({
    body: z.string().min(1).optional(),
    resolved: z.boolean().optional(),
});

/**
 * PATCH /api/comments/[id]
 * Update a comment
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const commentId = params.id;
        const body = await request.json();
        const validatedData = UpdateCommentSchema.parse(body);

        // Get comment and verify ownership
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
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

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // Check if user is the comment author or workspace admin
        const isAuthor = comment.userId === session.user.id;
        const isAdmin = comment.workspace.members.some(
            (m) => m.userId === session.user.id && ['OWNER', 'ADMIN'].includes(m.role)
        );

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Update comment
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: validatedData,
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

        // Create audit log if resolved
        if (validatedData.resolved !== undefined) {
            await prisma.auditLog.create({
                data: {
                    workspaceId: comment.workspaceId,
                    userId: session.user.id,
                    action: validatedData.resolved ? 'COMMENT_RESOLVED' : 'COMMENT_ADDED',
                    metadata: {
                        commentId: comment.id,
                        promptId: comment.promptId,
                    },
                },
            });
        }

        return NextResponse.json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to update comment' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/comments/[id]
 * Delete a comment
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const commentId = params.id;

        // Get comment and verify ownership
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
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

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // Check if user is the comment author or workspace admin
        const isAuthor = comment.userId === session.user.id;
        const isAdmin = comment.workspace.members.some(
            (m) => m.userId === session.user.id && ['OWNER', 'ADMIN'].includes(m.role)
        );

        if (!isAuthor && !isAdmin) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Delete comment (cascade will delete replies)
        await prisma.comment.delete({
            where: { id: commentId },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                workspaceId: comment.workspaceId,
                userId: session.user.id,
                action: 'COMMENT_DELETED',
                metadata: {
                    commentId: comment.id,
                    promptId: comment.promptId,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
