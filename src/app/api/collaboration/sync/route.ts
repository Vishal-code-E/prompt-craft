/**
 * Collaboration Sync API Route
 * 
 * Handles CRDT state synchronization with the server
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as Y from 'yjs';

/**
 * GET /api/collaboration/sync
 * Get the current CRDT state for a prompt
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const promptId = searchParams.get('promptId');

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

        // Get or create collaborative session
        let session_data = await prisma.collaborativeSession.findUnique({
            where: { promptId },
        });

        if (!session_data) {
            // Create new session with initial state from prompt
            const ydoc = new Y.Doc();
            const jsonText = ydoc.getText('json');
            const toonText = ydoc.getText('toon');

            ydoc.transact(() => {
                jsonText.insert(0, JSON.stringify(prompt.json, null, 2));
                toonText.insert(0, prompt.toon);
            });

            const state = Y.encodeStateAsUpdate(ydoc);

            session_data = await prisma.collaborativeSession.create({
                data: {
                    promptId,
                    ydocState: Buffer.from(state),
                    version: 1,
                },
            });
        }

        // Convert Buffer to array for JSON serialization
        const stateArray = session_data.ydocState
            ? Array.from(session_data.ydocState)
            : null;

        return NextResponse.json({
            state: stateArray,
            version: session_data.version,
            lastSyncedAt: session_data.lastSyncedAt,
        });
    } catch (error) {
        console.error('Error fetching collaboration state:', error);
        return NextResponse.json(
            { error: 'Failed to fetch collaboration state' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/collaboration/sync
 * Update the CRDT state for a prompt
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { promptId, state, version } = body;

        if (!promptId || !state) {
            return NextResponse.json(
                { error: 'promptId and state are required' },
                { status: 400 }
            );
        }

        // Verify user has access to the prompt
        const prompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            include: {
                workspace: {
                    include: {
                        members: {
                            where: {
                                userId: session.user.id,
                                role: { in: ['OWNER', 'ADMIN', 'MEMBER'] },
                            },
                        },
                    },
                },
            },
        });

        if (!prompt || prompt.workspace.members.length === 0) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Convert state array to Buffer
        const stateBuffer = Buffer.from(state);

        // Update or create collaborative session
        const updatedSession = await prisma.collaborativeSession.upsert({
            where: { promptId },
            update: {
                ydocState: stateBuffer,
                version: { increment: 1 },
                lastSyncedAt: new Date(),
            },
            create: {
                promptId,
                ydocState: stateBuffer,
                version: 1,
            },
        });

        // Also update the prompt with the latest content
        // Decode the Y.js state to get the actual content
        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, new Uint8Array(state));

        const jsonText = ydoc.getText('json').toString();
        const toonText = ydoc.getText('toon').toString();

        try {
            const jsonData = JSON.parse(jsonText);

            await prisma.prompt.update({
                where: { id: promptId },
                data: {
                    json: jsonData,
                    toon: toonText,
                    updatedAt: new Date(),
                },
            });

            // Create collaboration history entry
            await prisma.collaborationHistory.create({
                data: {
                    promptId,
                    userId: session.user.id,
                    changeType: 'collaborative_edit',
                    metadata: {
                        version: updatedSession.version,
                        timestamp: new Date().toISOString(),
                    },
                },
            });

            // Create audit log
            await prisma.auditLog.create({
                data: {
                    workspaceId: prompt.workspaceId,
                    userId: session.user.id,
                    action: 'COLLABORATIVE_EDIT',
                    metadata: {
                        promptId,
                        version: updatedSession.version,
                    },
                },
            });
        } catch (parseError) {
            console.error('Error parsing JSON from CRDT state:', parseError);
            // Continue anyway - the CRDT state is saved
        }

        return NextResponse.json({
            success: true,
            version: updatedSession.version,
            lastSyncedAt: updatedSession.lastSyncedAt,
        });
    } catch (error) {
        console.error('Error updating collaboration state:', error);
        return NextResponse.json(
            { error: 'Failed to update collaboration state' },
            { status: 500 }
        );
    }
}
