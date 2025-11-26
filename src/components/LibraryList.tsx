"use client";

import React, { useState } from 'react';
import { PromptMetadata } from '@/lib/localDb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Calendar,
  Tag,
  Play,
  Copy,
  Trash2,
  History,
  MoreVertical,
  Download,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LibraryListProps {
  prompts: PromptMetadata[];
  onLoad: (prompt: PromptMetadata) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onViewVersions: (id: string) => void;
  onExport: (prompt: PromptMetadata) => void;
}

export function LibraryList({
  prompts,
  onLoad,
  onDuplicate,
  onDelete,
  onViewVersions,
  onExport,
}: LibraryListProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  if (prompts.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No saved prompts yet</h3>
          <p className="text-gray-500 text-center">
            Create your first prompt in the Builder and save it to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {prompts.map((prompt) => (
        <Card key={prompt.id} className="border-2 hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{prompt.name}</CardTitle>
                {prompt.description && (
                  <CardDescription className="text-sm">{prompt.description}</CardDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedMenu(expandedMenu === prompt.id ? null : prompt.id)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            {/* Tags */}
            {prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {prompt.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Updated {formatDistanceToNow(prompt.updatedAt, { addSuffix: true })}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onLoad(prompt)}
                size="sm"
                className="gap-2 bg-[#00FF88] text-black hover:bg-[#00FF88]/90"
              >
                <Play className="w-4 h-4" />
                Load in Builder
              </Button>

              {expandedMenu === prompt.id && (
                <>
                  <Button
                    onClick={() => {
                      onDuplicate(prompt.id);
                      setExpandedMenu(null);
                    }}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </Button>

                  <Button
                    onClick={() => {
                      onViewVersions(prompt.id);
                      setExpandedMenu(null);
                    }}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <History className="w-4 h-4" />
                    Versions
                  </Button>

                  <Button
                    onClick={() => {
                      onExport(prompt);
                      setExpandedMenu(null);
                    }}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>

                  <Button
                    onClick={() => {
                      if (confirm(`Delete "${prompt.name}"?`)) {
                        onDelete(prompt.id);
                        setExpandedMenu(null);
                      }
                    }}
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
