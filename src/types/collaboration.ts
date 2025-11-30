/**
 * Phase 5: Realtime Collaboration Types
 * 
 * Types for CRDT-based collaborative editing, presence, comments, and realtime features
 */

import { User } from '@prisma/client';

// ========================================
// PRESENCE TYPES
// ========================================

export interface UserPresence {
    userId: string;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
    cursor?: {
        line: number;
        column: number;
        section: 'json' | 'toon' | 'rules';
    };
    selection?: {
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
        section: 'json' | 'toon' | 'rules';
    };
    status: 'active' | 'idle' | 'away';
    lastActivity: number; // timestamp
    color: string; // Assigned color for this user's cursor/highlights
}

export interface PresenceState {
    [userId: string]: UserPresence;
}

// ========================================
// COMMENT TYPES
// ========================================

export type CommentLocationType = 'json' | 'toon' | 'rule';

export interface CommentLocation {
    type: CommentLocationType;
    path?: string; // JSON path like "storyConfig.genre"
    line?: number; // Line number for TOON
    nodeId?: string; // Unique identifier for the commented element
    section?: string; // Additional context
}

export interface Comment {
    id: string;
    workspaceId: string;
    promptId: string;
    userId: string;
    user?: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
    body: string;
    location: CommentLocation;
    resolved: boolean;
    parentId: string | null;
    mentions: string[]; // User IDs
    replies?: Comment[];
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface CreateCommentInput {
    workspaceId: string;
    promptId: string;
    body: string;
    location: CommentLocation;
    parentId?: string;
    mentions?: string[];
}

export interface UpdateCommentInput {
    body?: string;
    resolved?: boolean;
}

// ========================================
// COLLABORATIVE EDITING TYPES
// ========================================

export interface CollaborativeSession {
    id: string;
    promptId: string;
    ydocState: Uint8Array | null;
    version: number;
    lastSyncedAt: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export type ChangeType =
    | 'json_edit'
    | 'toon_edit'
    | 'rule_add'
    | 'rule_delete'
    | 'rule_edit'
    | 'config_change'
    | 'metadata_change';

export interface CollaborationHistoryEntry {
    id: string;
    promptId: string;
    userId: string;
    user?: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
    changeType: ChangeType;
    changePath: string | null;
    oldValue: string | null;
    newValue: string | null;
    metadata: Record<string, any> | null;
    createdAt: Date | string;
}

// ========================================
// REALTIME EVENT TYPES
// ========================================

export type RealtimeEventType =
    | 'user_joined'
    | 'user_left'
    | 'cursor_moved'
    | 'selection_changed'
    | 'content_changed'
    | 'comment_added'
    | 'comment_updated'
    | 'comment_resolved'
    | 'comment_deleted'
    | 'presence_updated';

export interface RealtimeEvent {
    type: RealtimeEventType;
    userId: string;
    promptId: string;
    timestamp: number;
    data?: any;
}

export interface UserJoinedEvent extends RealtimeEvent {
    type: 'user_joined';
    data: {
        user: {
            id: string;
            name: string | null;
            email: string;
            image: string | null;
        };
    };
}

export interface UserLeftEvent extends RealtimeEvent {
    type: 'user_left';
    data: {
        userId: string;
    };
}

export interface CursorMovedEvent extends RealtimeEvent {
    type: 'cursor_moved';
    data: {
        cursor: UserPresence['cursor'];
    };
}

export interface ContentChangedEvent extends RealtimeEvent {
    type: 'content_changed';
    data: {
        section: 'json' | 'toon' | 'rules';
        changeType: ChangeType;
        path?: string;
    };
}

export interface CommentEvent extends RealtimeEvent {
    type: 'comment_added' | 'comment_updated' | 'comment_resolved' | 'comment_deleted';
    data: {
        comment: Comment;
    };
}

// ========================================
// CRDT SYNC TYPES
// ========================================

export interface YDocUpdate {
    promptId: string;
    update: Uint8Array;
    origin?: string; // User ID who made the change
}

export interface SyncState {
    isSyncing: boolean;
    lastSyncedAt: number | null;
    syncError: string | null;
    pendingChanges: number;
}

// ========================================
// MERGE & CONFLICT TYPES
// ========================================

export interface ConflictResolution {
    path: string;
    localValue: any;
    remoteValue: any;
    resolvedValue: any;
    strategy: 'local' | 'remote' | 'merged' | 'manual';
    resolvedBy: string; // User ID
    resolvedAt: number;
}

export interface MergeResult {
    success: boolean;
    conflicts: ConflictResolution[];
    mergedState: any;
    timestamp: number;
}

// ========================================
// NOTIFICATION TYPES
// ========================================

export type NotificationType =
    | 'user_joined'
    | 'user_left'
    | 'comment_added'
    | 'comment_mention'
    | 'comment_reply'
    | 'prompt_updated'
    | 'conflict_detected';

export interface RealtimeNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    userId?: string;
    user?: {
        name: string | null;
        image: string | null;
    };
    timestamp: number;
    read: boolean;
    data?: any;
}

// ========================================
// EDITOR INTEGRATION TYPES
// ========================================

export interface EditorAwareness {
    clientId: number;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        color: string;
    };
    cursor?: {
        line: number;
        column: number;
    };
    selection?: {
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
    };
}

export interface CollaborativeEditorState {
    isConnected: boolean;
    activeUsers: EditorAwareness[];
    currentUser: EditorAwareness | null;
    syncState: SyncState;
}

// ========================================
// WEBSOCKET MESSAGE TYPES
// ========================================

export type WebSocketMessageType =
    | 'sync_request'
    | 'sync_response'
    | 'update'
    | 'awareness'
    | 'ping'
    | 'pong';

export interface WebSocketMessage {
    type: WebSocketMessageType;
    promptId: string;
    userId: string;
    data: any;
    timestamp: number;
}
