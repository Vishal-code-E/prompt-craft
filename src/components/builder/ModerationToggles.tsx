"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePromptStore } from '@/store/promptStore';

export function ModerationToggles() {
    const { moderation, setVulgar, setCussing } = usePromptStore();

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-xl font-semibold mb-2">Moderation Settings</h3>
                <p className="text-gray-600 text-sm">
                    Control content moderation preferences
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="vulgar" className="text-base">
                            Allow Vulgar Content
                        </Label>
                        <p className="text-sm text-gray-500">
                            Permit vulgar language in the output
                        </p>
                    </div>
                    <Switch
                        id="vulgar"
                        checked={moderation.vulgar}
                        onCheckedChange={setVulgar}
                    />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="cussing" className="text-base">
                            Allow Cussing
                        </Label>
                        <p className="text-sm text-gray-500">
                            Permit profanity in the output
                        </p>
                    </div>
                    <Switch
                        id="cussing"
                        checked={moderation.cussing}
                        onCheckedChange={setCussing}
                    />
                </div>
            </div>
        </div>
    );
}
