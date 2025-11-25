"use client";

import React from 'react';
import { PageHeader } from '@/components/builder/PageHeader';
import { Container } from '@/components/builder/Container';
import { QuickPromptGenerator } from '@/components/builder/QuickPromptGenerator';
import { FineTuneSection } from '@/components/builder/FineTuneSection';
import { RulesSection } from '@/components/builder/RulesSection';
import { StoryConfigSection } from '@/components/builder/StoryConfigSection';
import { ModerationToggles } from '@/components/builder/ModerationToggles';
import { NumericControls } from '@/components/builder/NumericControls';
import { JSONPreviewPanel } from '@/components/builder/JSONPreviewPanel';

export default function BuilderPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <PageHeader />

                <div className="grid lg:grid-cols-[1fr,500px] gap-8">
                    {/* Left Column - Form Controls */}
                    <div className="space-y-6">
                        <Container>
                            <QuickPromptGenerator />
                        </Container>

                        <Container>
                            <FineTuneSection />
                        </Container>

                        <Container>
                            <RulesSection />
                        </Container>

                        <Container>
                            <StoryConfigSection />
                        </Container>

                        <Container>
                            <ModerationToggles />
                        </Container>

                        <Container>
                            <NumericControls />
                        </Container>
                    </div>

                    {/* Right Column - JSON Preview (Sticky) */}
                    <div className="lg:sticky lg:top-8 h-fit">
                        <Container>
                            <JSONPreviewPanel />
                        </Container>
                    </div>
                </div>
            </div>
        </div>
    );
}
