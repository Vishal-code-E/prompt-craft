/**
 * Presence Preview Component
 * 
 * Displays active users with avatars and status indicators
 */

'use client';

import React from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wifi, WifiOff } from 'lucide-react';

export function PresencePreview() {
    const { presenceState, currentUserPresence, isConnected } = useRealtime();

    const activeUsers = Object.values(presenceState).filter(
        (presence) => presence.userId !== currentUserPresence?.userId
    );

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500';
            case 'idle':
                return 'bg-yellow-500';
            case 'away':
                return 'bg-gray-400';
            default:
                return 'bg-gray-400';
        }
    };

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
                {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400">
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </div>

            {/* Active Users Count */}
            {activeUsers.length > 0 && (
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
                    </span>
                </div>
            )}

            {/* User Avatars */}
            <div className="flex items-center -space-x-2 ml-auto">
                <AnimatePresence>
                    {activeUsers.slice(0, 5).map((presence) => (
                        <motion.div
                            key={presence.userId}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative"
                        >
                            <div
                                className="relative ring-2 ring-white dark:ring-gray-900 rounded-full"
                                style={{ borderColor: presence.color }}
                            >
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={presence.user.image || undefined} />
                                    <AvatarFallback
                                        className="text-xs font-medium"
                                        style={{
                                            backgroundColor: presence.color + '20',
                                            color: presence.color,
                                        }}
                                    >
                                        {getInitials(presence.user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Status Indicator */}
                                <div
                                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(
                                        presence.status
                                    )}`}
                                />
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {presence.user.name || presence.user.email}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* More users indicator */}
                {activeUsers.length > 5 && (
                    <div className="relative ring-2 ring-white dark:ring-gray-900 rounded-full">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                +{activeUsers.length - 5}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
