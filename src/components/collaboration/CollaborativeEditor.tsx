/**
 * Collaborative Monaco Editor
 * 
 * Monaco editor with Y.js CRDT integration for realtime collaboration
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useRealtime } from '@/contexts/RealtimeContext';
import type { editor } from 'monaco-editor';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';

interface CollaborativeEditorProps {
    value: string;
    onChange?: (value: string) => void;
    language: 'json' | 'plaintext';
    height?: string;
    readOnly?: boolean;
    section: 'json' | 'toon';
}

export function CollaborativeEditor({
    value,
    onChange,
    language,
    height = '400px',
    readOnly = false,
    section,
}: CollaborativeEditorProps) {
    const { crdtProvider, updatePresence, isConnected } = useRealtime();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const [isReady, setIsReady] = useState(false);

    /**
     * Handle editor mount
     */
    const handleEditorDidMount = (
        editor: editor.IStandaloneCodeEditor,
        monaco: Monaco
    ) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        setIsReady(true);

        // Setup cursor tracking
        editor.onDidChangeCursorPosition((e) => {
            if (crdtProvider && isConnected) {
                updatePresence({
                    cursor: {
                        line: e.position.lineNumber,
                        column: e.position.column,
                        section,
                    },
                });
            }
        });

        // Setup selection tracking
        editor.onDidChangeCursorSelection((e) => {
            if (crdtProvider && isConnected && !e.selection.isEmpty()) {
                updatePresence({
                    selection: {
                        startLine: e.selection.startLineNumber,
                        startColumn: e.selection.startColumn,
                        endLine: e.selection.endLineNumber,
                        endColumn: e.selection.endColumn,
                        section,
                    },
                });
            }
        });
    };

    /**
     * Setup Y.js binding when CRDT provider is available
     */
    useEffect(() => {
        if (!crdtProvider || !editorRef.current || !monacoRef.current || !isReady) {
            return;
        }

        // Get the appropriate Y.Text based on section
        const yText = section === 'json' ? crdtProvider.jsonText : crdtProvider.toonText;

        // Create Monaco binding
        const binding = new MonacoBinding(
            yText,
            editorRef.current.getModel()!,
            new Set([editorRef.current]),
            crdtProvider.getAwareness() as any
        );

        bindingRef.current = binding;

        console.log(`[CollaborativeEditor] Y.js binding created for ${section}`);

        return () => {
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
        };
    }, [crdtProvider, isReady, section]);

    /**
     * Handle local changes (when not using CRDT)
     */
    const handleChange = (value: string | undefined) => {
        if (!crdtProvider && onChange) {
            onChange(value || '');
        }
    };

    /**
     * Render remote cursors
     */
    useEffect(() => {
        if (!editorRef.current || !monacoRef.current || !crdtProvider) {
            return;
        }

        const editor = editorRef.current;
        const monaco = monacoRef.current;
        const decorations: string[] = [];

        // Get awareness states
        const awarenessStates = crdtProvider.getAwarenessStates();

        // Create decorations for each remote cursor
        const newDecorations = awarenessStates
            .filter((state) => state.cursor && state.user.id !== crdtProvider.getUserId())
            .map((state) => {
                const cursor = state.cursor!;
                return {
                    range: new monaco.Range(
                        cursor.line,
                        cursor.column,
                        cursor.line,
                        cursor.column
                    ),
                    options: {
                        className: 'remote-cursor',
                        glyphMarginClassName: 'remote-cursor-glyph',
                        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                        hoverMessage: {
                            value: `**${state.user.name}** is here`,
                        },
                    },
                };
            });

        // Apply decorations
        const newDecorationIds = editor.deltaDecorations(decorations, newDecorations);
        decorations.splice(0, decorations.length, ...newDecorationIds);

        return () => {
            if (editorRef.current) {
                editorRef.current.deltaDecorations(decorations, []);
            }
        };
    }, [crdtProvider]);

    return (
        <div className="relative">
            {/* Connection indicator */}
            {isConnected && crdtProvider && (
                <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-md flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live
                </div>
            )}

            <Editor
                height={height}
                language={language}
                value={value}
                onChange={handleChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                }}
            />

            {/* Custom styles for remote cursors */}
            <style jsx global>{`
        .remote-cursor {
          background-color: rgba(255, 0, 0, 0.3);
          border-left: 2px solid red;
        }
        .remote-cursor-glyph {
          background-color: red;
        }
      `}</style>
        </div>
    );
}
