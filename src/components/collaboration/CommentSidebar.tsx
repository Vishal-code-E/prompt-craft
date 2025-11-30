/**
 * Comment Sidebar Component
 * 
 * Displays and manages inline comments on prompts
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    MessageSquare,
    Send,
    Check,
    Trash2,
    MoreVertical,
    X,
    Filter,
    CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { Comment, CommentLocation } from '@/types/collaboration';

interface CommentSidebarProps {
    promptId: string;
    workspaceId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function CommentSidebar({
    promptId,
    workspaceId,
    isOpen,
    onClose,
}: CommentSidebarProps) {
    const { data: session } = useSession();
    const { comments, addComment, updateComment, deleteComment, resolveComment } = useRealtime();
    const [newCommentBody, setNewCommentBody] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [filterResolved, setFilterResolved] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<CommentLocation | null>(null);

    // Filter comments
    const filteredComments = useMemo(() => {
        let filtered = comments.filter((c) => c.promptId === promptId && !c.parentId);

        if (filterResolved) {
            filtered = filtered.filter((c) => !c.resolved);
        }

        return filtered.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [comments, promptId, filterResolved]);

    const handleAddComment = async () => {
        if (!newCommentBody.trim() || !session?.user?.id) return;

        const location: CommentLocation = selectedLocation || {
            type: 'json',
            path: '',
        };

        await addComment({
            workspaceId,
            promptId,
            userId: session.user.id,
            body: newCommentBody,
            location,
            resolved: false,
            parentId: replyingTo,
            mentions: [],
        });

        setNewCommentBody('');
        setReplyingTo(null);
        setSelectedLocation(null);
    };

    const handleResolve = async (commentId: string) => {
        await resolveComment(commentId);
    };

    const handleDelete = async (commentId: string) => {
        if (confirm('Are you sure you want to delete this comment?')) {
            await deleteComment(commentId);
        }
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

    const getLocationLabel = (location: CommentLocation) => {
        switch (location.type) {
            case 'json':
                return `JSON${location.path ? `: ${location.path}` : ''}`;
            case 'toon':
                return `TOON${location.line ? `: Line ${location.line}` : ''}`;
            case 'rule':
                return `Rule${location.nodeId ? ` #${location.nodeId}` : ''}`;
            default:
                return 'General';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Comments
                            </h2>
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                {filteredComments.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilterResolved(!filterResolved)}
                                className={filterResolved ? 'bg-gray-100 dark:bg-gray-800' : ''}
                            >
                                <Filter className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Comments List */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {filteredComments.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No comments yet
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                                        Add a comment to start the conversation
                                    </p>
                                </div>
                            ) : (
                                filteredComments.map((comment) => (
                                    <CommentCard
                                        key={comment.id}
                                        comment={comment}
                                        onResolve={handleResolve}
                                        onDelete={handleDelete}
                                        onReply={() => setReplyingTo(comment.id)}
                                        getInitials={getInitials}
                                        getLocationLabel={getLocationLabel}
                                        currentUserId={session?.user?.id}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    {/* New Comment Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        {replyingTo && (
                            <div className="mb-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                <span>Replying to comment...</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplyingTo(null)}
                                    className="h-6 px-2"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <textarea
                                value={newCommentBody}
                                onChange={(e) => setNewCommentBody(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                                rows={3}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                        handleAddComment();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Cmd/Ctrl + Enter to send
                            </span>
                            <Button
                                size="sm"
                                onClick={handleAddComment}
                                disabled={!newCommentBody.trim()}
                            >
                                <Send className="w-4 h-4 mr-1" />
                                Send
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface CommentCardProps {
    comment: Comment;
    onResolve: (id: string) => void;
    onDelete: (id: string) => void;
    onReply: () => void;
    getInitials: (name: string | null) => string;
    getLocationLabel: (location: CommentLocation) => string;
    currentUserId?: string;
}

function CommentCard({
    comment,
    onResolve,
    onDelete,
    onReply,
    getInitials,
    getLocationLabel,
    currentUserId,
}: CommentCardProps) {
    const [showActions, setShowActions] = useState(false);
    const isOwner = comment.userId === currentUserId;

    return (
        <div
            className={`p-3 rounded-lg border ${comment.resolved
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={comment.user?.image || undefined} />
                        <AvatarFallback className="text-xs">
                            {getInitials(comment.user?.name || null)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.user?.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>

                {showActions && (
                    <div className="flex items-center gap-1">
                        {!comment.resolved && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onResolve(comment.id)}
                                className="h-7 px-2"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        {isOwner && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(comment.id)}
                                className="h-7 px-2 text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Location Badge */}
            <div className="mb-2">
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    {getLocationLabel(comment.location)}
                </span>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.body}
            </p>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600 space-y-2">
                    {comment.replies.map((reply) => (
                        <div key={reply.id} className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">
                                {reply.user?.name || 'Anonymous'}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">{reply.body}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Reply Button */}
            {!comment.resolved && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReply}
                    className="mt-2 h-7 text-xs"
                >
                    Reply
                </Button>
            )}

            {/* Resolved Badge */}
            {comment.resolved && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                    <Check className="w-3 h-3" />
                    <span>Resolved</span>
                </div>
            )}
        </div>
    );
}
