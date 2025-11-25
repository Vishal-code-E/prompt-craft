import { JSONOutput } from '@/utils/buildJSON';

// LLM Provider Types
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'cohere' | 'local';

export interface LLMConfig {
    provider: LLMProvider;
    model: string;
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
}

// Intermediate format from LLM parsing
export interface IntermediateFormat {
    main_task: string;
    rules: string[];
    genre: string;
    plot: string;
    specifics: string[];
    moderation: {
        allow_vulgar: boolean;
        allow_cussing: boolean;
    };
    limits: {
        min_words: number;
        max_words: number;
        max_chapters: number;
        uniqueness: number;
    };
}

// API Request/Response Types
export interface GenerateRequest {
    input: string;
    provider?: LLMProvider;
    model?: string;
}

export interface GenerateResponse {
    success: boolean;
    json?: JSONOutput;
    toon?: string;
    error?: string;
}

export interface ClassifyRequest {
    input: string;
}

export interface ClassifyResponse {
    success: boolean;
    type?: string;
    tone?: string;
    genre?: string;
    complexity?: 'simple' | 'moderate' | 'complex';
    error?: string;
}

// Re-export JSONOutput for convenience
export type { JSONOutput };
