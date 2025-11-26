"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToonEditor } from '@/components/ToonEditor';
import { usePromptStore } from '@/store/promptStore';
import { toonToJSON, jsonToTOON } from '@/lib/toon/index';
import { buildJSON } from '@/utils/buildJSON';
import { Badge } from '@/components/ui/badge';
import { Code2, FileJson } from 'lucide-react';

export default function PlaygroundPage() {
  const {
    toonSource,
    setToonSource,
    toonParseError,
    setToonParseError,
    loadFromAI,
    mainTask,
    rules,
    story,
    moderation,
    limits,
  } = usePromptStore();

  const [jsonPreview, setJsonPreview] = useState<string>('');

  // Generate TOON from current state
  useEffect(() => {
    const currentJSON = buildJSON({
      mainTask,
      rules,
      story,
      moderation,
      limits,
      generatedJSON: null,
      generatedTOON: null,
      isGenerating: false,
      generationError: null,
      currentPromptId: null,
      currentPromptName: null,
      isSaved: false,
      toonSource: '',
      toonParseError: null,
    });
    
    if (!toonSource && currentJSON) {
      const generated = jsonToTOON({ STORY: currentJSON });
      setToonSource(generated);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update JSON preview whenever TOON changes
  useEffect(() => {
    if (toonSource) {
      const result = toonToJSON(toonSource);
      if (result.success) {
        setJsonPreview(JSON.stringify(result.data, null, 2));
        setToonParseError(null);
      } else {
        setToonParseError(result.error?.message || 'Parse error');
      }
    }
  }, [toonSource, setToonParseError]);

  const handleParse = (json: unknown) => {
    try {
      setJsonPreview(JSON.stringify(json, null, 2));
      setToonParseError(null);

      // Extract STORY data if present
      const data = json as Record<string, unknown>;
      const storyData = data.STORY || data;

      // Update Zustand store with parsed data
      if (typeof storyData === 'object' && storyData !== null) {
        loadFromAI(storyData as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    } catch (error) {
      setToonParseError(error instanceof Error ? error.message : 'Failed to parse TOON');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="w-8 h-8 text-[#00FF88]" />
            <h1 className="text-4xl font-bold">TOON Playground</h1>
            <Badge className="bg-[#00FF88] text-black hover:bg-[#00FF88]/90">Beta</Badge>
          </div>
          <p className="text-gray-600 text-lg">
            Edit TOON DSL directly with syntax highlighting and real-time validation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: TOON Editor */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#00FF88]" />
                <CardTitle>TOON Editor</CardTitle>
              </div>
              <CardDescription>
                Write or paste TOON DSL code with syntax highlighting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ToonEditor
                value={toonSource}
                onChange={setToonSource}
                onParse={handleParse}
                error={toonParseError}
              />
            </CardContent>
          </Card>

          {/* Right: JSON Preview */}
          <Card className="border-2 shadow-lg border-[#00FF88]/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-[#00FF88]" />
                <CardTitle>JSON Preview</CardTitle>
                <Badge variant="outline" className="ml-auto">
                  Read-only
                </Badge>
              </div>
              <CardDescription>
                Parsed JSON output from your TOON code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <pre className="text-sm overflow-x-auto max-h-[600px] overflow-y-auto">
                  <code className="language-json">{jsonPreview || '{}'}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8 border-2">
          <CardHeader>
            <CardTitle className="text-lg">TOON DSL Syntax Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Keywords (UPPERCASE)</h4>
                <p className="text-gray-600 mb-2">
                  Use uppercase for keys: <code className="bg-gray-100 px-1 rounded">GENRE</code>,{' '}
                  <code className="bg-gray-100 px-1 rounded">PLOT</code>,{' '}
                  <code className="bg-gray-100 px-1 rounded">RULES</code>
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Arrays (Dash Prefix)</h4>
                <p className="text-gray-600 mb-2">
                  Use <code className="bg-gray-100 px-1 rounded">-</code> for array items
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Strings (Quoted)</h4>
                <p className="text-gray-600 mb-2">
                  Wrap text in quotes: <code className="bg-gray-100 px-1 rounded">&quot;Some text&quot;</code>
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Booleans</h4>
                <p className="text-gray-600 mb-2">
                  Use <code className="bg-gray-100 px-1 rounded">TRUE</code> or{' '}
                  <code className="bg-gray-100 px-1 rounded">FALSE</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
