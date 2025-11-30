/**
 * Collaboration History Viewer
 * 
 * Displays the history of collaborative changes with diff viewer
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { History, Clock, User, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactDiffViewer from 'react-diff-viewer-continued';
import type { CollaborationHistoryEntry } from '@/types/collaboration';

interface CollaborationHistoryProps {
    promptId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function CollaborationHistory({
    promptId,
    isOpen,
    onClose,
}: CollaborationHistoryProps) {
    const [history, setHistory] = useState<CollaborationHistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<CollaborationHistoryEntry | null>(null);
    const [showDiff, setShowDiff] = useState(false);

    useEffect(() => {
        if (isOpen && promptId) {
            loadHistory();
        }
    }, [isOpen, promptId]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/collaboration/history?promptId=${promptId}&limit=100`);
            if (response.ok) {
                const data = await response.json();
                setHistory(data.history || []);
            }
        } catch (error) {
            console.error('Failed to load collaboration history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getChangeTypeLabel = (changeType: string) => {
        const labels: Record<string, string> = {
            json_edit: 'JSON Edit',
            toon_edit: 'TOON Edit',
            rule_add: 'Rule Added',
            rule_delete: 'Rule Deleted',
            rule_edit: 'Rule Edited',
            config_change: 'Config Changed',
            metadata_change: 'Metadata Changed',
            collaborative_edit: 'Collaborative Edit',
        };
        return labels[changeType] || changeType;
    };

    const getChangeTypeColor = (changeType: string) => {
        const colors: Record<string, string> = {
            json_edit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            toon_edit: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            rule_add: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            rule_delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            rule_edit: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
            config_change: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
            collaborative_edit: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        };
        return colors[changeType] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    };

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleViewDiff = (entry: CollaborationHistoryEntry) => {
        setSelectedEntry(entry);
        setShowDiff(true);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Collaboration History
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="h-[60vh] pr-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12">
                                <History className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No collaboration history yet
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <Avatar className="w-8 h-8 mt-1">
                                                    <AvatarImage src={entry.user?.image || undefined} />
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(entry.user?.name || null)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {entry.user?.name || 'Unknown User'}
                                                        </p>
                                                        <span
                                                            className={`px-2 py-0.5 text-xs font-medium rounded ${getChangeTypeColor(
                                                                entry.changeType
                                                            )}`}
                                                        >
                                                            {getChangeTypeLabel(entry.changeType)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                        <Clock className="w-3 h-3" />
                                                        <span>
                                                            {formatDistanceToNow(new Date(entry.createdAt), {
                                                                addSuffix: true,
                                                            })}
                                                        </span>
                                                    </div>

                                                    {entry.changePath && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                            <FileText className="w-3 h-3" />
                                                            <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                                                                {entry.changePath}
                                                            </code>
                                                        </div>
                                                    )}

                                                    {entry.metadata && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {JSON.stringify(entry.metadata, null, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {entry.oldValue && entry.newValue && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDiff(entry)}
                                                    className="ml-2"
                                                >
                                                    View Diff
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Diff Viewer Dialog */}
            <Dialog open={showDiff} onOpenChange={setShowDiff}>
                <DialogContent className="max-w-5xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Change Diff</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh]">
                        {selectedEntry && (
                            <ReactDiffViewer
                                oldValue={selectedEntry.oldValue || ''}
                                newValue={selectedEntry.newValue || ''}
                                splitView={true}
                                useDarkTheme={true}
                                leftTitle="Before"
                                rightTitle="After"
                            />
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
