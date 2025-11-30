/**
 * Realtime Notifications Component
 * 
 * Displays toast notifications for collaboration events
 */

'use client';

import React, { useEffect } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageSquare, AlertCircle, UserPlus, UserMinus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { RealtimeNotification } from '@/types/collaboration';

export function RealtimeNotifications() {
    const { notifications, dismissNotification } = useRealtime();

    // Auto-dismiss notifications after 5 seconds
    useEffect(() => {
        const timers = notifications.map((notification) => {
            if (!notification.read) {
                return setTimeout(() => {
                    dismissNotification(notification.id);
                }, 5000);
            }
            return null;
        });

        return () => {
            timers.forEach((timer) => timer && clearTimeout(timer));
        };
    }, [notifications, dismissNotification]);

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            <AnimatePresence>
                {notifications.slice(0, 3).map((notification) => (
                    <NotificationToast
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => dismissNotification(notification.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

interface NotificationToastProps {
    notification: RealtimeNotification;
    onDismiss: () => void;
}

function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
    const getIcon = () => {
        switch (notification.type) {
            case 'user_joined':
                return <UserPlus className="w-5 h-5 text-green-500" />;
            case 'user_left':
                return <UserMinus className="w-5 h-5 text-gray-500" />;
            case 'comment_added':
            case 'comment_mention':
            case 'comment_reply':
                return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'prompt_updated':
                return <Users className="w-5 h-5 text-purple-500" />;
            case 'conflict_detected':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Users className="w-5 h-5 text-gray-500" />;
        }
    };

    const getBgColor = () => {
        switch (notification.type) {
            case 'user_joined':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'user_left':
                return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
            case 'comment_added':
            case 'comment_mention':
            case 'comment_reply':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'prompt_updated':
                return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
            case 'conflict_detected':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            default:
                return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`w-full p-4 rounded-lg border shadow-lg ${getBgColor()}`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                {notification.message}
                            </p>
                        </div>

                        {/* Dismiss Button */}
                        <button
                            onClick={onDismiss}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* User Avatar (if applicable) */}
                    {notification.user && (
                        <div className="flex items-center gap-2 mt-2">
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={notification.user.image || undefined} />
                                <AvatarFallback className="text-xs">
                                    {notification.user.name?.[0] || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {notification.user.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
