"use client";

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PromptVersion, getVersions, restoreVersion } from '@/lib/localDb';
import { formatDistanceToNow } from 'date-fns';
import { Clock, RotateCcw, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptId: string;
  promptName: string;
  onRestore?: () => void;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  promptId,
  promptName,
  onRestore,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [, setComparing] = useState(false);

  useEffect(() => {
    if (isOpen && promptId) {
      loadVersions();
    }
  }, [isOpen, promptId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadVersions = async () => {
    const versionList = await getVersions(promptId);
    setVersions(versionList);
    if (versionList.length > 0) {
      setSelectedVersion(versionList[0]);
    }
  };

  const handleRestore = async (version: number) => {
    if (confirm(`Restore version ${version}? This will create a new version with this content.`)) {
      await restoreVersion(promptId, version);
      if (onRestore) {
        onRestore();
      }
      onClose();
    }
  };

  const getDiff = (version1: PromptVersion, version2: PromptVersion) => {
    const changes: string[] = [];
    
    // Compare JSON keys
    const keys1 = Object.keys(version1.json);
    const keys2 = Object.keys(version2.json);
    
    const addedKeys = keys2.filter(k => !keys1.includes(k));
    const removedKeys = keys1.filter(k => !keys2.includes(k));
    
    if (addedKeys.length > 0) {
      changes.push(`Added: ${addedKeys.join(', ')}`);
    }
    if (removedKeys.length > 0) {
      changes.push(`Removed: ${removedKeys.join(', ')}`);
    }
    
    return changes.length > 0 ? changes.join(' | ') : 'Minor changes';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00FF88]" />
            Version History: {promptName}
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of this prompt
          </DialogDescription>
        </DialogHeader>

        {versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No version history available
          </div>
        ) : (
          <div className="space-y-4">
            {/* Version List */}
            <div className="space-y-2">
              {versions.map((version, idx) => (
                <div
                  key={version.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedVersion?.id === version.id
                      ? 'border-[#00FF88] bg-[#00FF88]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                        v{version.version}
                        {idx === 0 && ' (Current)'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDistanceToNow(version.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVersion(version);
                          setComparing(true);
                        }}
                        className="gap-2"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      {idx !== 0 && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(version.version);
                          }}
                          className="gap-2"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                  {version.changes && (
                    <p className="text-sm text-gray-600 mt-2">{version.changes}</p>
                  )}
                  {idx < versions.length - 1 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {getDiff(version, versions[idx + 1])}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Selected Version Details */}
            {selectedVersion && (
              <Tabs defaultValue="json" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="json">JSON</TabsTrigger>
                  <TabsTrigger value="toon">TOON</TabsTrigger>
                </TabsList>
                <TabsContent value="json" className="mt-4">
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <pre className="text-sm overflow-x-auto max-h-96">
                      <code>{JSON.stringify(selectedVersion.json, null, 2)}</code>
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="toon" className="mt-4">
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <pre className="text-sm overflow-x-auto max-h-96 whitespace-pre-wrap">
                      <code>{selectedVersion.toon}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
