import { create } from 'zustand';
import { JSONOutput } from '@/utils/buildJSON';

export interface PromptState {
    mainTask: string;
    rules: string[];
    story: {
        genre: string;
        plot: string;
        specifics: string[];
    };
    moderation: {
        vulgar: boolean;
        cussing: boolean;
    };
    limits: {
        minWords: number;
        maxWords: number;
        chapters: number;
        uniqueness: number;
    };
    // AI generation state
    generatedJSON: JSONOutput | null;
    generatedTOON: string | null;
    isGenerating: boolean;
    generationError: string | null;
}

interface PromptActions {
    setMainTask: (task: string) => void;
    addRule: (rule: string) => void;
    deleteRule: (index: number) => void;
    setGenre: (genre: string) => void;
    setPlot: (plot: string) => void;
    setSpecifics: (specifics: string[]) => void;
    setVulgar: (value: boolean) => void;
    setCussing: (value: boolean) => void;
    setMinWords: (value: number) => void;
    setMaxWords: (value: number) => void;
    setMaxChapters: (value: number) => void;
    setUniqueness: (value: number) => void;
    // AI integration actions
    loadFromAI: (data: JSONOutput) => void;
    setGeneratedJSON: (json: JSONOutput | null) => void;
    setGeneratedTOON: (toon: string | null) => void;
    setIsGenerating: (loading: boolean) => void;
    setGenerationError: (error: string | null) => void;
    resetGeneration: () => void;
}

type PromptStore = PromptState & PromptActions;

export const usePromptStore = create<PromptStore>((set) => ({
    // Initial state
    mainTask: '',
    rules: [],
    story: {
        genre: 'fantasy',
        plot: '',
        specifics: [],
    },
    moderation: {
        vulgar: false,
        cussing: false,
    },
    limits: {
        minWords: 75,
        maxWords: 125,
        chapters: 1,
        uniqueness: 100,
    },
    // AI generation state
    generatedJSON: null,
    generatedTOON: null,
    isGenerating: false,
    generationError: null,

    // Actions
    setMainTask: (task) => set({ mainTask: task }),

    addRule: (rule) => set((state) => ({
        rules: [...state.rules, rule],
    })),

    deleteRule: (index) => set((state) => ({
        rules: state.rules.filter((_, i) => i !== index),
    })),

    setGenre: (genre) => set((state) => ({
        story: { ...state.story, genre },
    })),

    setPlot: (plot) => set((state) => ({
        story: { ...state.story, plot },
    })),

    setSpecifics: (specifics) => set((state) => ({
        story: { ...state.story, specifics },
    })),

    setVulgar: (value) => set((state) => ({
        moderation: { ...state.moderation, vulgar: value },
    })),

    setCussing: (value) => set((state) => ({
        moderation: { ...state.moderation, cussing: value },
    })),

    setMinWords: (value) => set((state) => ({
        limits: { ...state.limits, minWords: value },
    })),

    setMaxWords: (value) => set((state) => ({
        limits: { ...state.limits, maxWords: value },
    })),

    setMaxChapters: (value) => set((state) => ({
        limits: { ...state.limits, chapters: value },
    })),

    setUniqueness: (value) => set((state) => ({
        limits: { ...state.limits, uniqueness: value },
    })),

    // AI integration actions
    loadFromAI: (data: JSONOutput) => set({
        mainTask: data.task,
        rules: data.rules,
        story: {
            genre: data.storyConfig.genre,
            plot: data.storyConfig.plot,
            specifics: data.storyConfig.specifics,
        },
        moderation: {
            vulgar: data.moderation.allowVulgar,
            cussing: data.moderation.allowCussing,
        },
        limits: {
            minWords: data.limits.minWords,
            maxWords: data.limits.maxWords,
            chapters: data.limits.maxChapters,
            uniqueness: data.limits.uniqueness,
        },
        generatedJSON: data,
    }),

    setGeneratedJSON: (json) => set({ generatedJSON: json }),

    setGeneratedTOON: (toon) => set({ generatedTOON: toon }),

    setIsGenerating: (loading) => set({ isGenerating: loading }),

    setGenerationError: (error) => set({ generationError: error }),

    resetGeneration: () => set({
        generatedJSON: null,
        generatedTOON: null,
        isGenerating: false,
        generationError: null,
    }),
}));
