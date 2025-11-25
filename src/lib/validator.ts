import { z } from 'zod';

// Intermediate format schema (from LLM)
export const IntermediateFormatSchema = z.object({
    main_task: z.string().min(1, 'Main task is required'),
    rules: z.array(z.string()).default([]),
    genre: z.string().default('fantasy'),
    plot: z.string().default(''),
    specifics: z.array(z.string()).default([]),
    moderation: z.object({
        allow_vulgar: z.boolean().default(false),
        allow_cussing: z.boolean().default(false),
    }).default({ allow_vulgar: false, allow_cussing: false }),
    limits: z.object({
        min_words: z.number().min(1).max(10000).default(75),
        max_words: z.number().min(1).max(10000).default(125),
        max_chapters: z.number().min(1).max(100).default(1),
        uniqueness: z.number().min(0).max(100).default(100),
    }).default({
        min_words: 75,
        max_words: 125,
        max_chapters: 1,
        uniqueness: 100,
    }),
});

// Final JSON output schema
export const JSONOutputSchema = z.object({
    task: z.string(),
    rules: z.array(z.string()),
    storyConfig: z.object({
        genre: z.string(),
        plot: z.string(),
        specifics: z.array(z.string()),
    }),
    moderation: z.object({
        allowVulgar: z.boolean(),
        allowCussing: z.boolean(),
    }),
    limits: z.object({
        minWords: z.number(),
        maxWords: z.number(),
        maxChapters: z.number(),
        uniqueness: z.number(),
    }),
});

// Generate request schema
export const GenerateRequestSchema = z.object({
    input: z.string().min(1, 'Input is required'),
    provider: z.enum(['openai', 'anthropic', 'google', 'cohere', 'local']).optional(),
    model: z.string().optional(),
});

// Classify request schema
export const ClassifyRequestSchema = z.object({
    input: z.string().min(1, 'Input is required'),
});

// Validation helper functions
export function validateIntermediateFormat(data: unknown) {
    return IntermediateFormatSchema.safeParse(data);
}

export function validateJSONOutput(data: unknown) {
    return JSONOutputSchema.safeParse(data);
}

export function validateGenerateRequest(data: unknown) {
    return GenerateRequestSchema.safeParse(data);
}

export function validateClassifyRequest(data: unknown) {
    return ClassifyRequestSchema.safeParse(data);
}
