import React from 'react';

export function PageHeader() {
    return (
        <div className="text-center space-y-4 mb-12">
            <p className="text-sm font-mono text-gray-500">{"// Prompt as Code"}</p>
            <h1 className="text-4xl md:text-5xl font-bold">
                Prompt Builder
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Transform your ideas into structured JSON prompts with precision and control
            </p>
        </div>
    );
}
