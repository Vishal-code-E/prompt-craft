/**
 * Realtime Collaboration Context
 * 
 * Provides realtime collaboration state and actions to the entire app
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { CRDTProvider, createCRDTProvider } from '@/lib/crdt';
import type {
    UserPresence,
    PresenceState,
    Comment,
    RealtimeNotification,
    CollaborativeEditorState,
} from '@/types/collaboration';
import { createPromptChannel } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeContextValue {
    // Connection state
    isConnected: boolean;
    isSyncing: boolean;

    // Presence
    presenceState: PresenceState;
    currentUserPresence: UserPresence | null;
    updatePresence: (updates: Partial<UserPresence>) => void;

    // CRDT Provider
    crdtProvider: CRDTProvider | null;
    editorState: CollaborativeEditorState;

    // Comments
    comments: Comment[];
    addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateComment: (commentId: string, updates: Partial<Comment>) => Promise<void>;
    deleteComment: (commentId: string) => Promise<void>;
    resolveComment: (commentId: string) => Promise<void>;

    // Notifications
    notifications: RealtimeNotification[];
    dismissNotification: (notificationId: string) => void;

    // Actions
    joinPrompt: (promptId: string) => Promise<void>;
    leavePrompt: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtime() {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error('useRealtime must be used within RealtimeProvider');
    }
    return context;
}

interface RealtimeProviderProps {
    children: React.ReactNode;
}

// User color palette for presence indicators
const USER_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
];

function getUserColor(userId: string): string {
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return USER_COLORS[hash % USER_COLORS.length];
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
    const { data: session } = useSession();
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [presenceState, setPresenceState] = useState<PresenceState>({});
    const [currentUserPresence, setCurrentUserPresence] = useState<UserPresence | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
    const [editorState, setEditorState] = useState<CollaborativeEditorState>({
        isConnected: false,
        activeUsers: [],
        currentUser: null,
        syncState: {
            isSyncing: false,
            lastSyncedAt: null,
            syncError: null,
            pendingChanges: 0,
        },
    });

    const crdtProviderRef = useRef<CRDTProvider | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const currentPromptIdRef = useRef<string | null>(null);

    /**
     * Join a prompt for realtime collaboration
     */
    const joinPrompt = useCallback(async (promptId: string) => {
        if (!session?.user?.id) {
            console.warn('[Realtime] Cannot join prompt: user not authenticated');
            return;
        }

        // Leave current prompt if any
        if (currentPromptIdRef.current) {
            leavePrompt();
        }

        currentPromptIdRef.current = promptId;
        const userId = session.user.id;
        const userName = session.user.name || session.user.email || 'Anonymous';
        const userColor = getUserColor(userId);

        try {
            // Create CRDT provider
            const provider = createCRDTProvider({
                promptId,
                userId,
                userName,
                userColor,
                onSync: (synced) => {
                    setIsConnected(synced);
                    setEditorState(prev => ({
                        ...prev,
                        isConnected: synced,
                    }));
                },
                onUpdate: (update, origin) => {
                    setIsSyncing(true);
                    setTimeout(() => setIsSyncing(false), 500);
                },
                onAwarenessChange: (states) => {
                    const awarenessArray = Array.from(states.entries()).map(([clientId, state]) => ({
                        clientId,
                        user: state.user,
                        cursor: state.cursor,
                        selection: state.selection,
                    }));

                    setEditorState(prev => ({
                        ...prev,
                        activeUsers: awarenessArray,
                    }));
                },
            });

            // Load initial state from server
            await provider.loadFromServer();

            crdtProviderRef.current = provider;

            // Setup presence channel
            const channel = createPromptChannel(promptId);

            // Track presence
            channel.on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const presenceMap: PresenceState = {};

                Object.entries(state).forEach(([key, presences]: [string, any[]]) => {
                    presences.forEach((presence) => {
                        if (presence.userId) {
                            presenceMap[presence.userId] = presence as UserPresence;
                        }
                    });
                });

                setPresenceState(presenceMap);
            });

            channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
                newPresences.forEach((presence: any) => {
                    if (presence.userId !== userId) {
                        addNotification({
                            type: 'user_joined',
                            title: 'User Joined',
                            message: `${presence.user.name || 'Someone'} joined the prompt`,
                            user: presence.user,
                            timestamp: Date.now(),
                        });
                    }
                });
            });

            channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                leftPresences.forEach((presence: any) => {
                    if (presence.userId !== userId) {
                        addNotification({
                            type: 'user_left',
                            title: 'User Left',
                            message: `${presence.user.name || 'Someone'} left the prompt`,
                            user: presence.user,
                            timestamp: Date.now(),
                        });
                    }
                });
            });

            // Subscribe and track presence
            await channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    const userPresence: UserPresence = {
                        userId,
                        user: {
                            id: userId,
                            name: session.user?.name || null,
                            email: session.user?.email || '',
                            image: session.user?.image || null,
                        },
                        status: 'active',
                        lastActivity: Date.now(),
                        color: userColor,
                    };
                    await channel.track(userPresence);
                    setCurrentUserPresence(userPresence);
                }
            });

            channelRef.current = channel;

            // Load comments
            await loadComments(promptId);

            console.log('[Realtime] Joined prompt:', promptId);
        } catch (error) {
            console.error('[Realtime] Failed to join prompt:', error);
            addNotification({
                type: 'conflict_detected',
                title: 'Connection Error',
                message: 'Failed to connect to realtime collaboration',
                timestamp: Date.now(),
            });
        }
    }, [session]);

    /**
     * Leave current prompt
     */
    const leavePrompt = useCallback(() => {
        if (crdtProviderRef.current) {
            crdtProviderRef.current.destroy();
            crdtProviderRef.current = null;
        }

        if (channelRef.current) {
            channelRef.current.unsubscribe();
            channelRef.current = null;
        }

        currentPromptIdRef.current = null;
        setIsConnected(false);
        setPresenceState({});
        setCurrentUserPresence(null);
        setComments([]);

        console.log('[Realtime] Left prompt');
    }, []);

    /**
     * Update user presence
     */
    const updatePresence = useCallback((updates: Partial<UserPresence>) => {
        if (!currentUserPresence || !channelRef.current) return;

        const newPresence = {
            ...currentUserPresence,
            ...updates,
            lastActivity: Date.now(),
        };

        channelRef.current.track(newPresence);
        setCurrentUserPresence(newPresence);

        // Update CRDT awareness
        if (crdtProviderRef.current && updates.cursor) {
            crdtProviderRef.current.updateAwareness({
                cursor: updates.cursor,
                selection: updates.selection || null,
            });
        }
    }, [currentUserPresence]);

    /**
     * Load comments for current prompt
     */
    const loadComments = async (promptId: string) => {
        try {
            const response = await fetch(`/api/comments?promptId=${promptId}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments || []);
            }
        } catch (error) {
            console.error('[Realtime] Failed to load comments:', error);
        }
    };

    /**
     * Add a new comment
     */
    const addComment = async (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comment),
            });

            if (response.ok) {
                const newComment = await response.json();
                setComments(prev => [...prev, newComment]);

                addNotification({
                    type: 'comment_added',
                    title: 'New Comment',
                    message: 'A new comment was added',
                    timestamp: Date.now(),
                });
            }
        } catch (error) {
            console.error('[Realtime] Failed to add comment:', error);
        }
    };

    /**
     * Update a comment
     */
    const updateComment = async (commentId: string, updates: Partial<Comment>) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const updatedComment = await response.json();
                setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
            }
        } catch (error) {
            console.error('[Realtime] Failed to update comment:', error);
        }
    };

    /**
     * Delete a comment
     */
    const deleteComment = async (commentId: string) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setComments(prev => prev.filter(c => c.id !== commentId));
            }
        } catch (error) {
            console.error('[Realtime] Failed to delete comment:', error);
        }
    };

    /**
     * Resolve a comment
     */
    const resolveComment = async (commentId: string) => {
        await updateComment(commentId, { resolved: true });
    };

    /**
     * Add a notification
     */
    const addNotification = (notification: Omit<RealtimeNotification, 'id' | 'read'>) => {
        const newNotification: RealtimeNotification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random()}`,
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    };

    /**
     * Dismiss a notification
     */
    const dismissNotification = useCallback((notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            leavePrompt();
        };
    }, [leavePrompt]);

    const value: RealtimeContextValue = {
        isConnected,
        isSyncing,
        presenceState,
        currentUserPresence,
        updatePresence,
        crdtProvider: crdtProviderRef.current,
        editorState,
        comments,
        addComment,
        updateComment,
        deleteComment,
        resolveComment,
        notifications,
        dismissNotification,
        joinPrompt,
        leavePrompt,
    };

    return (
        <RealtimeContext.Provider value={value}>
            {children}
        </RealtimeContext.Provider>
    );
}
