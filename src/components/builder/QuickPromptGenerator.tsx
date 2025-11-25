"use client";

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function QuickPromptGenerator() {
    const [quickInput, setQuickInput] = React.useState('');

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold mb-2">Quick Prompt Generator</h2>
                <p className="text-gray-600 text-sm">
                    Describe your prompt in plain English (Phase 1: placeholder only)
                </p>
            </div>

            <Textarea
                placeholder="E.g., Create a fantasy story about a wizard's journey..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                className="min-h-[120px] resize-none"
            />

            <Button
                className="w-full"
                disabled
            >
                Generate Structure (Coming in Phase 2)
            </Button>
        </div>
    );
}
