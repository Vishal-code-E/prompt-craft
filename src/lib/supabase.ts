/**
 * Supabase Client for Realtime Collaboration
 * 
 * Configures Supabase Realtime for presence, broadcasting, and database changes
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Realtime features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});

/**
 * Create a realtime channel for a specific prompt
 */
export function createPromptChannel(promptId: string) {
    return supabase.channel(`prompt:${promptId}`, {
        config: {
            broadcast: {
                self: true, // Receive own messages for debugging
                ack: true, // Request acknowledgment
            },
            presence: {
                key: promptId,
            },
        },
    });
}

/**
 * Create a realtime channel for workspace-level events
 */
export function createWorkspaceChannel(workspaceId: string) {
    return supabase.channel(`workspace:${workspaceId}`, {
        config: {
            broadcast: {
                self: false,
                ack: false,
            },
        },
    });
}

/**
 * Subscribe to database changes for comments
 */
export function subscribeToComments(
    promptId: string,
    callback: (payload: any) => void
) {
    return supabase
        .channel(`comments:${promptId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'Comment',
                filter: `promptId=eq.${promptId}`,
            },
            callback
        )
        .subscribe();
}

/**
 * Subscribe to collaborative session changes
 */
export function subscribeToCollaborativeSession(
    promptId: string,
    callback: (payload: any) => void
) {
    return supabase
        .channel(`session:${promptId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'CollaborativeSession',
                filter: `promptId=eq.${promptId}`,
            },
            callback
        )
        .subscribe();
}

export default supabase;
