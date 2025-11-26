"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePromptStore } from '@/store/promptStore';
import { buildJSON } from '@/utils/buildJSON';
import { jsonToTOON } from '@/lib/toon/index';
import { savePrompt, updatePrompt } from '@/lib/localDb';
import { Copy, Check, Save, Edit3 } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

export function JSONPreviewPanel() {
    const state = usePromptStore();
    const [activeTab, setActiveTab] = useState<'json' | 'toon'>('json');
    const [copied, setCopied] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [promptName, setPromptName] = useState('');
    const [promptTags, setPromptTags] = useState('');
    const [saving, setSaving] = useState(false);
    const codeRef = React.useRef<HTMLElement>(null);

    const { generatedJSON, generatedTOON, currentPromptId, currentPromptName, isSaved, setIsSaved } = state;

    // Build current JSON from store state
    const currentJSON = buildJSON(state);

    // Use generated JSON if available, otherwise use current state
    const displayJSON = generatedJSON || currentJSON;
    const jsonString = JSON.stringify(displayJSON, null, 2);

    // Auto-generate TOON from JSON
    const [autoTOON, setAutoTOON] = useState('');

    useEffect(() => {
        try {
            const toon = jsonToTOON({ STORY: displayJSON });
            setAutoTOON(toon);
        } catch (error) {
            console.error('Failed to generate TOON:', error);
        }
    }, [displayJSON]);

    React.useEffect(() => {
        if (codeRef.current && activeTab === 'json') {
            Prism.highlightElement(codeRef.current);
        }
    }, [jsonString, activeTab]);

    const handleCopy = async () => {
        const textToCopy = activeTab === 'json'
            ? jsonString
            : (generatedTOON || autoTOON);

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const jsonObj = displayJSON as Record<string, unknown>;
            const toonText = generatedTOON || autoTOON;
            const tags = promptTags.split(',').map(t => t.trim()).filter(Boolean);

            if (currentPromptId) {
                // Update existing prompt
                await updatePrompt(currentPromptId, {
                    name: promptName || currentPromptName || 'Untitled Prompt',
                    json: jsonObj,
                    toon: toonText,
                    tags,
                });
            } else {
                // Save new prompt
                await savePrompt(
                    promptName || 'Untitled Prompt',
                    jsonObj,
                    toonText,
                    tags
                );
            }

            setIsSaved(true);
            setSaveDialogOpen(false);
            setPromptName('');
            setPromptTags('');
        } catch (error) {
            console.error('Failed to save prompt:', error);
            alert('Failed to save prompt');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Preview</h3>
                    <p className="text-gray-600 text-sm">
                        Live preview of your structured prompt
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            setPromptName(currentPromptName || '');
                            setSaveDialogOpen(true);
                        }}
                        size="sm"
                        className="gap-2 bg-[#00FF88] text-black hover:bg-[#00FF88]/90"
                    >
                        {currentPromptId ? (
                            <>
                                <Edit3 className="h-4 w-4" />
                                Update
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Copy {activeTab === 'json' ? 'JSON' : 'TOON'}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab('json')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'json'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    JSON
                </button>
                <button
                    onClick={() => setActiveTab('toon')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'toon'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    TOON DSL
                </button>
            </div>

            {/* Content */}
            <div className="relative">
                {activeTab === 'json' ? (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto" suppressHydrationWarning>
                        <code ref={codeRef} className="language-json">
                            {jsonString}
                        </code>
                    </pre>
                ) : (
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg max-h-[600px] overflow-y-auto">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                            {generatedTOON || autoTOON}
                        </pre>
                    </div>
                )}
            </div>

            {generatedJSON && (
                <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="font-medium text-blue-900">✨ AI Generated</p>
                    <p className="mt-1">This structure was generated from your natural language input</p>
                </div>
            )}

            {/* Save Dialog */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {currentPromptId ? 'Update Prompt' : 'Save Prompt'}
                        </DialogTitle>
                        <DialogDescription>
                            {currentPromptId
                                ? 'Update the prompt with your latest changes'
                                : 'Give your prompt a name and tags to save it to your library'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Prompt Name</label>
                            <Input
                                value={promptName}
                                onChange={(e) => setPromptName(e.target.value)}
                                placeholder="My Awesome Prompt"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Tags (comma-separated)
                            </label>
                            <Input
                                value={promptTags}
                                onChange={(e) => setPromptTags(e.target.value)}
                                placeholder="fiction, sci-fi, creative"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !promptName.trim()}
                            className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90"
                        >
                            {saving ? 'Saving...' : currentPromptId ? 'Update' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
