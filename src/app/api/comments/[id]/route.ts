/**
 * Individual Comment API Route
 * 
 * Handles update and delete operations for specific comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { id: commentId } = await params;
        const body = await request.json();
        const validatedData = UpdateCommentSchema.parse(body);

        // Get comment and verify ownership
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                workspace: {
                    include: {
                        members: {
                            where: { userId },
                        },
                    },
                },
            },
        });

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
;
        }

        // Check if user is the comment author or workspace admin
        const isAuthor = comment.userId === userId;
        type WorkspaceMember = { userId: string; role: string };
        const isAdmin = comment.workspace.members.some(
            (m: WorkspaceMember) => m.userId === userId && ['OWNER', 'ADMIN'].includes(m.role)
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
                    userId,
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
                { error: 'Invalid request data', details: error.issues },
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { id: commentId } = await params;

        // Get comment and verify ownership
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                workspace: {
                    include: {
                        members: {
                            where: { userId },
                        },
                    },
                },
            },
        });

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // Check if user is the comment author or workspace admin
        const isAuthor = comment.userId === userId;
        type WorkspaceMember = { userId: string; role: string };
        const isAdmin = comment.workspace.members.some(
            (m: WorkspaceMember) => m.userId === userId && ['OWNER', 'ADMIN'].includes(m.role)
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
                userId,
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
