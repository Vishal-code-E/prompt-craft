import { create } from 'zustand';
import { JSONOutput } from '@/utils/buildJSON';
import { PromptMetadata } from '@/lib/localDb';

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
    // Library state
    currentPromptId: string | null;
    currentPromptName: string | null;
    isSaved: boolean;
    // TOON editing state
    toonSource: string; // Raw TOON text being edited
    toonParseError: string | null;
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
    // Library actions
    loadPrompt: (prompt: PromptMetadata) => void;
    saveCurrentPrompt: () => Promise<void>;
    clearCurrentPrompt: () => void;
    setIsSaved: (saved: boolean) => void;
    // TOON editing actions
    setToonSource: (toon: string) => void;
    parseToonSource: () => void;
    setToonParseError: (error: string | null) => void;
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
    // Library state
    currentPromptId: null,
    currentPromptName: null,
    isSaved: false,
    // TOON editing state
    toonSource: '',
    toonParseError: null,

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

    // Library actions
    loadPrompt: (prompt: PromptMetadata) => {
        const json = prompt.json as JSONOutput;
        set({
            currentPromptId: prompt.id,
            currentPromptName: prompt.name,
            isSaved: true,
            mainTask: json.task || '',
            rules: json.rules || [],
            story: {
                genre: json.storyConfig?.genre || 'fantasy',
                plot: json.storyConfig?.plot || '',
                specifics: json.storyConfig?.specifics || [],
            },
            moderation: {
                vulgar: json.moderation?.allowVulgar || false,
                cussing: json.moderation?.allowCussing || false,
            },
            limits: {
                minWords: json.limits?.minWords || 75,
                maxWords: json.limits?.maxWords || 125,
                chapters: json.limits?.maxChapters || 1,
                uniqueness: json.limits?.uniqueness || 100,
            },
            generatedJSON: json,
            toonSource: prompt.toon,
        });
    },

    saveCurrentPrompt: async () => {
        // This will be called from components with full save logic
        set({ isSaved: true });
    },

    clearCurrentPrompt: () => set({
        currentPromptId: null,
        currentPromptName: null,
        isSaved: false,
    }),

    setIsSaved: (saved) => set({ isSaved: saved }),

    // TOON editing actions
    setToonSource: (toon: string) => set({ 
        toonSource: toon,
        isSaved: false,
    }),

    parseToonSource: () => {
        // This will be implemented with full TOON parsing logic in components
        set({ toonParseError: null });
    },

    setToonParseError: (error: string | null) => set({ toonParseError: error }),
}));
