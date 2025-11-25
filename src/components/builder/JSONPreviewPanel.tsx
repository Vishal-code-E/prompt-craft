"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePromptStore } from '@/store/promptStore';
import { buildJSON } from '@/utils/buildJSON';
import { Copy, Check } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';

export function JSONPreviewPanel() {
    const state = usePromptStore();
    const [activeTab, setActiveTab] = useState<'json' | 'toon'>('json');
    const [copied, setCopied] = useState(false);
    const codeRef = React.useRef<HTMLElement>(null);

    const { generatedJSON, generatedTOON } = state;

    // Build current JSON from store state
    const currentJSON = buildJSON(state);

    // Use generated JSON if available, otherwise use current state
    const displayJSON = generatedJSON || currentJSON;
    const jsonString = JSON.stringify(displayJSON, null, 2);

    React.useEffect(() => {
        if (codeRef.current && activeTab === 'json') {
            Prism.highlightElement(codeRef.current);
        }
    }, [jsonString, activeTab]);

    const handleCopy = async () => {
        const textToCopy = activeTab === 'json'
            ? jsonString
            : generatedTOON || '';

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
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
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
                        <code ref={codeRef} className="language-json">
                            {jsonString}
                        </code>
                    </pre>
                ) : (
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg max-h-[600px] overflow-y-auto">
                        {generatedTOON ? (
                            <pre className="text-sm font-mono whitespace-pre-wrap">
                                {generatedTOON}
                            </pre>
                        ) : (
                            <div className="text-gray-400 text-center py-8">
                                <p>TOON DSL will appear here after AI generation</p>
                                <p className="text-sm mt-2">Use the Quick Prompt Generator to create a TOON structure</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {generatedJSON && (
                <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="font-medium text-blue-900">✨ AI Generated</p>
                    <p className="mt-1">This structure was generated from your natural language input</p>
                </div>
            )}
        </div>
    );
}
