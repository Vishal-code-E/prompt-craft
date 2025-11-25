"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePromptStore } from '@/store/promptStore';

const GENRES = [
    'fantasy',
    'sci-fi',
    'mystery',
    'romance',
    'thriller',
    'horror',
    'adventure',
    'historical',
    'contemporary',
    'other',
];

export function StoryConfigSection() {
    const { story, setGenre, setPlot, setSpecifics } = usePromptStore();
    const [specificsText, setSpecificsText] = React.useState('');

    const handleSpecificsChange = (text: string) => {
        setSpecificsText(text);
        const specificsArray = text
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        setSpecifics(specificsArray);
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-xl font-semibold mb-2">Story Configuration</h3>
                <p className="text-gray-600 text-sm">
                    Define the story parameters and details
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={story.genre} onValueChange={setGenre}>
                    <SelectTrigger id="genre">
                        <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                        {GENRES.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                                {genre.charAt(0).toUpperCase() + genre.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="plot">Plot / Storyline</Label>
                <Textarea
                    id="plot"
                    placeholder="Describe the main plot or storyline..."
                    value={story.plot}
                    onChange={(e) => setPlot(e.target.value)}
                    className="min-h-[100px] resize-none"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="specifics">Specifics (comma-separated)</Label>
                <Textarea
                    id="specifics"
                    placeholder="E.g., dragons, magic, medieval setting"
                    value={specificsText}
                    onChange={(e) => handleSpecificsChange(e.target.value)}
                    className="min-h-[80px] resize-none"
                />
                {story.specifics.length > 0 && (
                    <p className="text-xs text-gray-500">
                        {story.specifics.length} specific{story.specifics.length !== 1 ? 's' : ''} added
                    </p>
                )}
            </div>
        </div>
    );
}
