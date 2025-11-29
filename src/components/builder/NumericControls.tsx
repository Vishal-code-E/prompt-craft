"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { usePromptStore } from '@/store/promptStore';

export function NumericControls() {
    const {
        limits,
        setMinWords,
        setMaxWords,
        setMaxChapters,
        setUniqueness,
    } = usePromptStore();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold mb-2">Numeric Controls</h3>
                <p className="text-gray-600 text-sm">
                    Adjust word limits, chapters, and uniqueness
                </p>
            </div>

            <div className="space-y-4">
                {/* Min Words */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="minWords">Minimum Words</Label>
                        <Input
                            id="minWords"
                            type="number"
                            value={limits.minWords}
                            onChange={(e) => setMinWords(Number(e.target.value))}
                            className="w-20 text-center"
                            min={0}
                            max={1000}
                        />
                    </div>
                    <Slider
                        value={[limits.minWords]}
                        onValueChange={(value) => setMinWords(value[0])}
                        min={0}
                        max={1000}
                        step={5}
                        className="w-full"
                    />
                </div>

                {/* Max Words */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="maxWords">Maximum Words</Label>
                        <Input
                            id="maxWords"
                            type="number"
                            value={limits.maxWords}
                            onChange={(e) => setMaxWords(Number(e.target.value))}
                            className="w-20 text-center"
                            min={0}
                            max={2000}
                        />
                    </div>
                    <Slider
                        value={[limits.maxWords]}
                        onValueChange={(value) => setMaxWords(value[0])}
                        min={0}
                        max={2000}
                        step={5}
                        className="w-full"
                    />
                </div>

                {/* Max Chapters */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="maxChapters">Maximum Chapters</Label>
                        <Input
                            id="maxChapters"
                            type="number"
                            value={limits.chapters}
                            onChange={(e) => setMaxChapters(Number(e.target.value))}
                            className="w-20 text-center"
                            min={1}
                            max={50}
                        />
                    </div>
                    <Slider
                        value={[limits.chapters]}
                        onValueChange={(value) => setMaxChapters(value[0])}
                        min={1}
                        max={50}
                        step={1}
                        className="w-full"
                    />
                </div>

                {/* Uniqueness */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="uniqueness">Uniqueness (%)</Label>
                        <Input
                            id="uniqueness"
                            type="number"
                            value={limits.uniqueness}
                            onChange={(e) => setUniqueness(Number(e.target.value))}
                            className="w-20 text-center"
                            min={0}
                            max={100}
                        />
                    </div>
                    <Slider
                        value={[limits.uniqueness]}
                        onValueChange={(value) => setUniqueness(value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
}
/* Numeric controls*/