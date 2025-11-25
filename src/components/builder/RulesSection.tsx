"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { usePromptStore } from '@/store/promptStore';
import { X, Plus } from 'lucide-react';

export function RulesSection() {
    const { rules, addRule, deleteRule } = usePromptStore();
    const [newRule, setNewRule] = React.useState('');

    const handleAddRule = () => {
        if (newRule.trim()) {
            addRule(newRule.trim());
            setNewRule('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddRule();
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-xl font-semibold mb-2">Rules</h3>
                <p className="text-gray-600 text-sm">
                    Add specific rules or constraints for your prompt
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="newRule">Add Rule</Label>
                <div className="flex gap-2">
                    <Input
                        id="newRule"
                        placeholder="E.g., No violence"
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <Button
                        onClick={handleAddRule}
                        size="icon"
                        variant="outline"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {rules.length > 0 && (
                <div className="space-y-2">
                    <Label>Current Rules</Label>
                    <div className="space-y-2">
                        {rules.map((rule, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border"
                            >
                                <span className="flex-1 text-sm">{rule}</span>
                                <Button
                                    onClick={() => deleteRule(index)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
