"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePromptStore } from '@/store/promptStore';

export function FineTuneSection() {
    const { mainTask, setMainTask } = usePromptStore();

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold mb-2">Fine-Tune Your Prompt</h2>
                <p className="text-gray-600 text-sm">
                    Define the main task and specific requirements
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="mainTask">Main Task</Label>
                <Input
                    id="mainTask"
                    placeholder="E.g., Write a compelling story"
                    value={mainTask}
                    onChange={(e) => setMainTask(e.target.value)}
                />
            </div>
        </div>
    );
}
