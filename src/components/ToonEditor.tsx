"use client";

import React, { useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { toonToJSON, formatTOON } from '@/lib/toon/index';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Wand2 } from 'lucide-react';

interface ToonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onParse?: (json: unknown) => void;
  error?: string | null;
}

export function ToonEditor({ value, onChange, onParse, error }: ToonEditorProps) {
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorWillMount = (monaco: Monaco) => {
    monacoRef.current = monaco;

    // Register TOON language
    monaco.languages.register({ id: 'toon' });

    // Define TOON syntax highlighting
    monaco.languages.setMonarchTokensProvider('toon', {
      keywords: [
        'STORY', 'GENRE', 'LENGTH', 'STRICTNESS', 'RULES', 'PLOT',
        'CHARACTERS', 'SETTING', 'TONE', 'STYLE', 'TEMPERATURE',
        'MAX_TOKENS', 'TOP_P', 'FREQUENCY_PENALTY', 'PRESENCE_PENALTY',
        'MODERATION', 'FILTER_PROFANITY', 'FILTER_VIOLENCE', 'FILTER_ADULT',
        'TRUE', 'FALSE', 'HIGH', 'MEDIUM', 'LOW',
        'SCI_FI', 'FANTASY', 'MYSTERY', 'ROMANCE', 'HORROR',
        'THRILLER', 'ADVENTURE', 'DRAMA', 'COMEDY',
      ],
      tokenizer: {
        root: [
          // Keywords
          [/[A-Z_]+/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier',
            },
          }],
          // Strings
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          // Numbers
          [/-?\d+(\.\d+)?/, 'number'],
          // Special characters
          [/[{}:]/, 'delimiter'],
          [/-/, 'operator'],
          // Comments
          [/#.*$/, 'comment'],
          [/\/\/.*$/, 'comment'],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop'],
        ],
      },
    });

    // Define theme
    monaco.editor.defineTheme('toon-theme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '00FF88', fontStyle: 'bold' },
        { token: 'identifier', foreground: '0066CC' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'delimiter', foreground: '000000' },
        { token: 'operator', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F5F5F5',
        'editorLineNumber.foreground': '#999999',
      },
    });
  };

  const handleParse = () => {
    const result = toonToJSON(value);
    if (result.success && onParse) {
      onParse(result.data);
    }
  };

  const handleFormat = () => {
    const result = formatTOON(value);
    if (result.success && result.data) {
      onChange(result.data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleParse}
          size="sm"
          className="gap-2"
          variant="default"
        >
          <CheckCircle2 className="w-4 h-4" />
          Parse TOON
        </Button>
        <Button
          onClick={handleFormat}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Wand2 className="w-4 h-4" />
          Format TOON
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        <Editor
          height="600px"
          language="toon"
          theme="toon-theme"
          value={value}
          onChange={(value) => onChange(value || '')}
          beforeMount={handleEditorWillMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            folding: true,
            renderLineHighlight: 'all',
          }}
        />
      </div>
    </div>
  );
}
