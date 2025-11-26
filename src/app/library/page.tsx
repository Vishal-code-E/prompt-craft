"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LibraryList } from '@/components/LibraryList';
import { VersionHistoryModal } from '@/components/VersionHistoryModal';
import { usePromptStore } from '@/store/promptStore';
import { Library, Search, Plus, AlertCircle } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface PromptMetadata {
  id: string;
  name: string;
  description: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export default function LibraryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const { loadPrompt } = usePromptStore();

  const [prompts, setPrompts] = useState<PromptMetadata[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<PromptMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [selectedPromptName, setSelectedPromptName] = useState<string>('');

  useEffect(() => {
    if (status === 'authenticated' && currentWorkspace) {
      loadPrompts();
    } else if (status === 'unauthenticated') {
      router.push('/signup');
    }
  }, [status, currentWorkspace, router]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = prompts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPrompts(filtered);
    } else {
      setFilteredPrompts(prompts);
    }
  }, [searchQuery, prompts]);

  const loadPrompts = async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/prompts?workspaceId=${currentWorkspace.id}`);
      if (!response.ok) throw new Error('Failed to load prompts');
      
      const data = await response.json();
      const formattedPrompts = data.prompts.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        tags: p.tags || [],
        createdAt: new Date(p.createdAt).getTime(),
        updatedAt: new Date(p.updatedAt).getTime(),
      }));
      setPrompts(formattedPrompts);
      setFilteredPrompts(formattedPrompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (prompt: PromptMetadata) => {
    if (!currentWorkspace) return;
    
    try {
      const response = await fetch(`/api/prompts/${prompt.id}`);
      if (!response.ok) throw new Error('Failed to load prompt');
      const data = await response.json();
      loadPrompt(data.prompt);
      router.push('/products');
    } catch (err) {
      console.error('Failed to load prompt:', err);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!currentWorkspace) return;
    
    try {
      const response = await fetch(`/api/prompts/${id}`);
      if (!response.ok) throw new Error('Failed to load prompt');
      const data = await response.json();
      
      const duplicateResponse = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          name: `${data.prompt.name} (Copy)`,
          description: data.prompt.description,
          content: data.prompt.content,
          tags: data.prompt.tags,
        }),
      });
      
      if (!duplicateResponse.ok) throw new Error('Failed to duplicate prompt');
      await loadPrompts();
    } catch (err) {
      console.error('Failed to duplicate prompt:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentWorkspace) return;
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete prompt');
      await loadPrompts();
    } catch (err) {
      console.error('Failed to delete prompt:', err);
    }
  };

  const handleViewVersions = (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) {
      setSelectedPromptId(id);
      setSelectedPromptName(prompt.name);
      setVersionModalOpen(true);
    }
  };

  const handleExport = async (prompt: PromptMetadata) => {
    try {
      const response = await fetch(`/api/prompts/${prompt.id}`);
      if (!response.ok) throw new Error('Failed to load prompt');
      const data = await response.json();
      
      const exportData = {
        name: data.prompt.name,
        description: data.prompt.description,
        content: data.prompt.content,
        tags: data.prompt.tags,
        exportedAt: new Date().toISOString(),
      };
      
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.name.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export prompt:', err);
    }
  };

  // Show loading state while checking auth
  if (status === 'loading' || workspaceLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Loading...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error if no workspace
  if (!currentWorkspace && status === 'authenticated') {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Workspace Found
              </h3>
              <p className="text-gray-500">
                Please create a workspace to continue.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-gray-50 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Library className="w-8 h-8 text-[#00FF88]" />
              <div>
                <h1 className="text-4xl font-bold">Prompt Library</h1>
                <p className="text-gray-600 mt-1">
                  Manage and organize your saved prompts in {currentWorkspace?.name}
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/products')}
              className="gap-2 bg-[#00FF88] text-black hover:bg-[#00FF88]/90"
            >
              <Plus className="w-4 h-4" />
              New Prompt
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{prompts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tags Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Set(prompts.flatMap((p) => p.tags)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {prompts.length > 0
                  ? new Date(Math.max(...prompts.map((p) => p.updatedAt))).toLocaleDateString()
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search prompts by name, tags, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Loading prompts...
              </CardContent>
            </Card>
          ) : filteredPrompts.length === 0 && searchQuery ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No prompts found
                </h3>
                <p className="text-gray-500">
                  Try a different search term or create a new prompt
                </p>
              </CardContent>
            </Card>
          ) : (
            <LibraryList
              prompts={filteredPrompts}
              onLoad={handleLoad}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onViewVersions={handleViewVersions}
              onExport={handleExport}
            />
          )}
        </div>

        {/* Version History Modal */}
        <VersionHistoryModal
          isOpen={versionModalOpen}
          onClose={() => setVersionModalOpen(false)}
          promptId={selectedPromptId}
          promptName={selectedPromptName}
          onRestore={loadPrompts}
        />
      </div>
    </div>
  );
}
