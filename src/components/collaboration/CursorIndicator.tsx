/**
 * Cursor Indicator Component
 * 
 * Displays remote users' cursors in the editor
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { UserPresence } from '@/types/collaboration';

interface CursorIndicatorProps {
    presence: UserPresence;
    position: { top: number; left: number };
}

export function CursorIndicator({ presence, position }: CursorIndicatorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute pointer-events-none z-50"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {/* Cursor */}
            <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
            >
                <path
                    d="M2 2L18 8L8 12L2 18L2 2Z"
                    fill={presence.color}
                    stroke="white"
                    strokeWidth="1"
                />
            </svg>

            {/* User Label */}
            <div
                className="absolute top-5 left-5 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
                style={{ backgroundColor: presence.color }}
            >
                {presence.user.name || 'Anonymous'}
            </div>
        </motion.div>
    );
}

interface SelectionHighlightProps {
    presence: UserPresence;
    bounds: { top: number; left: number; width: number; height: number };
}

export function SelectionHighlight({ presence, bounds }: SelectionHighlightProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute pointer-events-none"
            style={{
                top: bounds.top,
                left: bounds.left,
                width: bounds.width,
                height: bounds.height,
                backgroundColor: presence.color,
            }}
        />
    );
}
