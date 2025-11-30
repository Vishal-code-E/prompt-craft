/**
 * Y.js CRDT Provider for Collaborative Editing
 * 
 * Manages Y.js document synchronization across multiple clients
 */

import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { createPromptChannel } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CRDTProviderOptions {
    promptId: string;
    userId: string;
    userName: string;
    userColor: string;
    onSync?: (isSynced: boolean) => void;
    onUpdate?: (update: Uint8Array, origin: any) => void;
    onAwarenessChange?: (states: Map<number, any>) => void;
}

export class CRDTProvider {
    private ydoc: Y.Doc;
    private channel: RealtimeChannel | null = null;
    private indexeddbProvider: IndexeddbPersistence | null = null;
    private awareness: Map<number, any> = new Map();
    private clientId: number;
    private options: CRDTProviderOptions;
    private isSynced: boolean = false;
    private updateHandlers: Set<(update: Uint8Array, origin: any) => void> = new Set();

    // Y.js shared types
    public jsonText: Y.Text;
    public toonText: Y.Text;
    public rulesArray: Y.Array<string>;
    public metadata: Y.Map<any>;

    constructor(options: CRDTProviderOptions) {
        this.options = options;
        this.ydoc = new Y.Doc();
        this.clientId = this.ydoc.clientID;

        // Initialize shared types
        this.jsonText = this.ydoc.getText('json');
        this.toonText = this.ydoc.getText('toon');
        this.rulesArray = this.ydoc.getArray('rules');
        this.metadata = this.ydoc.getMap('metadata');

        this.setupLocalPersistence();
        this.setupRealtimeSync();
        this.setupAwareness();
        this.setupUpdateHandlers();
    }

    /**
     * Setup IndexedDB persistence for offline support
     */
    private setupLocalPersistence() {
        if (typeof window !== 'undefined') {
            this.indexeddbProvider = new IndexeddbPersistence(
                `prompt-${this.options.promptId}`,
                this.ydoc
            );

            this.indexeddbProvider.on('synced', () => {
                console.log('[CRDT] Local persistence synced');
            });
        }
    }

    /**
     * Setup Supabase Realtime synchronization
     */
    private setupRealtimeSync() {
        this.channel = createPromptChannel(this.options.promptId);

        // Listen for updates from other clients
        this.channel.on('broadcast', { event: 'ydoc-update' }, ({ payload }) => {
            if (payload.origin !== this.options.userId) {
                const update = new Uint8Array(payload.update);
                Y.applyUpdate(this.ydoc, update, payload.origin);
            }
        });

        // Listen for awareness updates
        this.channel.on('broadcast', { event: 'awareness-update' }, ({ payload }) => {
            if (payload.clientId !== this.clientId) {
                this.awareness.set(payload.clientId, payload.state);
                this.options.onAwarenessChange?.(this.awareness);
            }
        });

        // Subscribe to the channel
        this.channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                this.isSynced = true;
                this.options.onSync?.(true);
                console.log('[CRDT] Connected to realtime channel');

                // Send initial state
                this.broadcastAwareness();
            } else if (status === 'CLOSED') {
                this.isSynced = false;
                this.options.onSync?.(false);
                console.log('[CRDT] Disconnected from realtime channel');
            }
        });
    }

    /**
     * Setup awareness (cursor positions, selections, etc.)
     */
    private setupAwareness() {
        const awarenessState = {
            user: {
                id: this.options.userId,
                name: this.options.userName,
                color: this.options.userColor,
            },
            cursor: null,
            selection: null,
            lastActivity: Date.now(),
        };

        this.awareness.set(this.clientId, awarenessState);
    }

    /**
     * Setup update handlers to broadcast changes
     */
    private setupUpdateHandlers() {
        this.ydoc.on('update', (update: Uint8Array, origin: any) => {
            // Don't broadcast updates that came from remote
            if (origin !== 'remote') {
                this.channel?.send({
                    type: 'broadcast',
                    event: 'ydoc-update',
                    payload: {
                        update: Array.from(update),
                        origin: this.options.userId,
                        timestamp: Date.now(),
                    },
                });
            }

            // Call custom update handlers
            this.updateHandlers.forEach(handler => handler(update, origin));
            this.options.onUpdate?.(update, origin);
        });
    }

    /**
     * Update awareness state (cursor, selection, etc.)
     */
    public updateAwareness(state: Partial<{
        cursor: { line: number; column: number } | null;
        selection: { startLine: number; startColumn: number; endLine: number; endColumn: number } | null;
    }>) {
        const currentState = this.awareness.get(this.clientId) || {};
        const newState = {
            ...currentState,
            ...state,
            lastActivity: Date.now(),
        };

        this.awareness.set(this.clientId, newState);
        this.broadcastAwareness();
    }

    /**
     * Broadcast awareness to other clients
     */
    private broadcastAwareness() {
        const state = this.awareness.get(this.clientId);
        if (state && this.channel) {
            this.channel.send({
                type: 'broadcast',
                event: 'awareness-update',
                payload: {
                    clientId: this.clientId,
                    state,
                    timestamp: Date.now(),
                },
            });
        }
    }

    /**
     * Get current document state
     */
    public getState() {
        return {
            json: this.jsonText.toString(),
            toon: this.toonText.toString(),
            rules: this.rulesArray.toArray(),
            metadata: this.metadata.toJSON(),
        };
    }

    /**
     * Load initial state into the document
     */
    public loadInitialState(state: {
        json?: string;
        toon?: string;
        rules?: string[];
        metadata?: Record<string, any>;
    }) {
        this.ydoc.transact(() => {
            if (state.json !== undefined && this.jsonText.length === 0) {
                this.jsonText.insert(0, state.json);
            }
            if (state.toon !== undefined && this.toonText.length === 0) {
                this.toonText.insert(0, state.toon);
            }
            if (state.rules !== undefined && this.rulesArray.length === 0) {
                this.rulesArray.push(state.rules);
            }
            if (state.metadata !== undefined) {
                Object.entries(state.metadata).forEach(([key, value]) => {
                    this.metadata.set(key, value);
                });
            }
        }, 'initial-load');
    }

    /**
     * Get all connected users' awareness states
     */
    public getAwarenessStates() {
        return Array.from(this.awareness.entries()).map(([clientId, state]) => ({
            clientId,
            ...state,
        }));
    }

    /**
     * Add custom update handler
     */
    public onUpdate(handler: (update: Uint8Array, origin: any) => void) {
        this.updateHandlers.add(handler);
        return () => this.updateHandlers.delete(handler);
    }

    /**
     * Persist current state to server
     */
    public async persistToServer() {
        const state = Y.encodeStateAsUpdate(this.ydoc);

        try {
            const response = await fetch(`/api/collaboration/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promptId: this.options.promptId,
                    state: Array.from(state),
                    version: this.metadata.get('version') || 0,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to persist state');
            }

            console.log('[CRDT] State persisted to server');
            return true;
        } catch (error) {
            console.error('[CRDT] Failed to persist state:', error);
            return false;
        }
    }

    /**
     * Load state from server
     */
    public async loadFromServer() {
        try {
            const response = await fetch(`/api/collaboration/sync?promptId=${this.options.promptId}`);

            if (!response.ok) {
                throw new Error('Failed to load state');
            }

            const data = await response.json();
            if (data.state) {
                const state = new Uint8Array(data.state);
                Y.applyUpdate(this.ydoc, state, 'server');
                console.log('[CRDT] State loaded from server');
            }

            return true;
        } catch (error) {
            console.error('[CRDT] Failed to load state:', error);
            return false;
        }
    }

    /**
     * Cleanup and disconnect
     */
    public destroy() {
        // Persist final state before destroying
        this.persistToServer();

        // Remove awareness
        this.awareness.delete(this.clientId);
        this.broadcastAwareness();

        // Unsubscribe from channel
        if (this.channel) {
            this.channel.unsubscribe();
            this.channel = null;
        }

        // Destroy IndexedDB persistence
        if (this.indexeddbProvider) {
            this.indexeddbProvider.destroy();
            this.indexeddbProvider = null;
        }

        // Clear handlers
        this.updateHandlers.clear();

        console.log('[CRDT] Provider destroyed');
    }
}

/**
 * Create a CRDT provider instance
 */
export function createCRDTProvider(options: CRDTProviderOptions): CRDTProvider {
    return new CRDTProvider(options);
}
