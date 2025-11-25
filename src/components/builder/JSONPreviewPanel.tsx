"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { usePromptStore } from '@/store/promptStore';
import { buildJSON } from '@/utils/buildJSON';
import { Copy, Check } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';

export function JSONPreviewPanel() {
    const state = usePromptStore();
    const [copied, setCopied] = React.useState(false);
    const codeRef = React.useRef<HTMLElement>(null);

    const jsonOutput = buildJSON(state);
    const jsonString = JSON.stringify(jsonOutput, null, 2);

    React.useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current);
        }
    }, [jsonString]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonString);
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
                    <h3 className="text-xl font-semibold">JSON Preview</h3>
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
                            Copy JSON
                        </>
                    )}
                </Button>
            </div>

            <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
                    <code ref={codeRef} className="language-json">
                        {jsonString}
                    </code>
                </pre>
            </div>
        </div>
    );
}
