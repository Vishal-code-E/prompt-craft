"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/builder/PageHeader';
import { QuickPromptGenerator } from '@/components/builder/QuickPromptGenerator';
import { FineTuneSection } from '@/components/builder/FineTuneSection';
import { RulesSection } from '@/components/builder/RulesSection';
import { StoryConfigSection } from '@/components/builder/StoryConfigSection';
import { ModerationToggles } from '@/components/builder/ModerationToggles';
import { NumericControls } from '@/components/builder/NumericControls';
import { JSONPreviewPanel } from '@/components/builder/JSONPreviewPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Settings, Shield, FileText, Sliders, Loader2 } from 'lucide-react';

export default function BuilderPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Handle client-side mounting to prevent hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect to signup if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signup?callbackUrl=/products');
        }
    }, [status, router]);

    // Show loading state while checking authentication
    if (!mounted || status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#00FF88] mx-auto" />
                    <p className="text-gray-600">Loading Prompt Builder...</p>
                </div>
            </div>
        );
    }

    // Show nothing while redirecting
    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <PageHeader />

                <div className="grid lg:grid-cols-[1fr,520px] gap-8 mt-8">
                    {/* Left Column - Form Controls */}
                    <div className="space-y-6">
                        {/* Quick Start Card */}
                        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#00FF88]" />
                                    <CardTitle className="text-xl">Quick Start</CardTitle>
                                    <Badge variant="secondary" className="ml-auto">AI-Powered</Badge>
                                </div>
                                <CardDescription>
                                    Generate prompts quickly with AI assistance
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <QuickPromptGenerator />
                            </CardContent>
                        </Card>

                        {/* Configuration Tabs */}
                        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-[#00FF88]" />
                                    <CardTitle className="text-xl">Configuration</CardTitle>
                                </div>
                                <CardDescription>
                                    Fine-tune your prompt parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="finetune" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-6">
                                        <TabsTrigger value="finetune" className="gap-2">
                                            <Sliders className="w-4 h-4" />
                                            Fine-tune
                                        </TabsTrigger>
                                        <TabsTrigger value="rules" className="gap-2">
                                            <Shield className="w-4 h-4" />
                                            Rules
                                        </TabsTrigger>
                                        <TabsTrigger value="story" className="gap-2">
                                            <FileText className="w-4 h-4" />
                                            Story
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="finetune" className="space-y-4 mt-4">
                                        <FineTuneSection />
                                    </TabsContent>

                                    <TabsContent value="rules" className="space-y-4 mt-4">
                                        <RulesSection />
                                    </TabsContent>

                                    <TabsContent value="story" className="space-y-4 mt-4">
                                        <StoryConfigSection />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Advanced Settings Card */}
                        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="text-xl">Advanced Settings</CardTitle>
                                <CardDescription>
                                    Fine-tune moderation and numeric parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-[#00FF88]" />
                                        Moderation Controls
                                    </h3>
                                    <ModerationToggles />
                                </div>

                                <Separator className="my-6" />

                                <div>
                                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                        <Sliders className="w-4 h-4 text-[#00FF88]" />
                                        Numeric Parameters
                                    </h3>
                                    <NumericControls />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - JSON Preview (Sticky) */}
                    <div className="lg:sticky lg:top-8 h-fit">
                        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300 border-[#00FF88]/20">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                                    <CardTitle className="text-xl">Live Preview</CardTitle>
                                    <Badge className="ml-auto bg-[#00FF88] text-black hover:bg-[#00FF88]/90">
                                        Real-time
                                    </Badge>
                                </div>
                                <CardDescription>
                                    Your configuration updates instantly
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <JSONPreviewPanel />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
