"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { usePromptStore } from '@/store/promptStore';
import { GenerateResponse } from '@/types/prompt';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

export function QuickPromptGenerator() {
    const [quickInput, setQuickInput] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const {
        loadFromAI,
        setGeneratedTOON,
        setIsGenerating,
        setGenerationError,
        isGenerating,
        generationError,
    } = usePromptStore();

    const handleGenerate = async () => {
        if (!quickInput.trim()) {
            setLocalError('Please enter a description');
            return;
        }

        setLocalError(null);
        setGenerationError(null);
        setIsGenerating(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: quickInput,
                    provider: 'google',
                    model: 'gemini-1.5-flash',
                }),
            });

            const data: GenerateResponse = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to generate structure');
            }

            if (data.json && data.toon) {
                // Populate store with generated data
                loadFromAI(data.json);
                setGeneratedTOON(data.toon);

                // Clear input on success
                setQuickInput('');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            setGenerationError(errorMessage);
            setLocalError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const displayError = localError || generationError;

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold mb-2">Quick Prompt Generator</h2>
                <p className="text-gray-600 text-sm">
                    Describe your prompt in plain English and let AI structure it for you
                </p>
            </div>

            <Textarea
                placeholder="E.g., Create a sci-fi story about a robot discovering emotions, 100-150 words, no cussing, high detail"
                value={quickInput}
                onChange={(e) => {
                    setQuickInput(e.target.value);
                    setLocalError(null);
                }}
                className="min-h-[120px] resize-none"
                disabled={isGenerating}
            />

            {displayError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                        <p className="font-medium">Error</p>
                        <p className="mt-1">{displayError}</p>
                    </div>
                </div>
            )}

            <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating || !quickInput.trim()}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Structure
                    </>
                )}
            </Button>

            {isGenerating && (
                <div className="text-sm text-gray-600 text-center">
                    <p>AI is analyzing your input and creating a structured prompt...</p>
                </div>
            )}
        </div>
    );
}
