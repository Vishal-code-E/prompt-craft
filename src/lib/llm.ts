import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMConfig } from '@/types/prompt';
import { logUsageAndDeductCredits, checkCredits, calculateCreditCost } from '@/lib/usage';
import { UsageType } from '@prisma/client';

// System prompt for deterministic JSON extraction
const SYSTEM_PROMPT = `You are a prompt structure analyzer. Your task is to convert natural language descriptions into a structured JSON format.

Extract the following information from the user's input:
1. main_task: The primary objective or task (string)
2. rules: Array of specific rules or constraints mentioned (string[])
3. genre: Story genre if mentioned (fantasy, sci-fi, romance, mystery, horror, adventure, thriller, drama, comedy, or other)
4. plot: Brief plot description if provided (string)
5. specifics: Specific details or requirements (string[])
6. moderation.allow_vulgar: Whether vulgar content is allowed (boolean, default: false)
7. moderation.allow_cussing: Whether cussing is allowed (boolean, default: false)
8. limits.min_words: Minimum word count (number, default: 75)
9. limits.max_words: Maximum word count (number, default: 125)
10. limits.max_chapters: Maximum number of chapters (number, default: 1)
11. limits.uniqueness: Uniqueness/creativity level 0-100 (number, default: 100)

IMPORTANT RULES:
- Output ONLY valid JSON, no markdown, no explanations
- Infer missing values intelligently from context
- Use defaults when information is not provided
- Extract numeric limits from phrases like "100-150 words" or "short story"
- Detect moderation flags from phrases like "no cussing", "family-friendly", "mature content"
- Map genre synonyms (e.g., "space opera" → "sci-fi", "detective" → "mystery")

Example input: "Create a sci-fi story about a robot discovering emotions, 100-150 words, no cussing"

Example output:
{
  "main_task": "Create a sci-fi story about a robot discovering emotions",
  "rules": ["no cussing"],
  "genre": "sci-fi",
  "plot": "A robot discovers emotions",
  "specifics": ["robot protagonist", "emotional discovery"],
  "moderation": {
    "allow_vulgar": false,
    "allow_cussing": false
  },
  "limits": {
    "min_words": 100,
    "max_words": 150,
    "max_chapters": 1,
    "uniqueness": 100
  }
}`;

// Available LLM providers with placeholder implementations
const LLM_PROVIDERS = {
    openai: {
        name: 'OpenAI',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-4o',
    },
    anthropic: {
        name: 'Anthropic',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
        defaultModel: 'claude-3-5-sonnet-20241022',
    },
    google: {
        name: 'Google',
        models: ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro'],
        defaultModel: 'gemini-1.5-flash-latest',
    },
    cohere: {
        name: 'Cohere',
        models: ['command-r-plus', 'command-r', 'command'],
        defaultModel: 'command-r-plus',
    },
    local: {
        name: 'Local Model',
        models: ['llama-3-70b', 'mixtral-8x7b', 'custom'],
        defaultModel: 'llama-3-70b',
    },
};

export function getAvailableProviders() {
    return LLM_PROVIDERS;
}

export function getProviderModels(provider: LLMProvider) {
    return LLM_PROVIDERS[provider]?.models || [];
}

// Main LLM inference function with usage metering
export async function generateStructure(
    input: string,
    config: Partial<LLMConfig> = {},
    context?: { workspaceId?: string; userId?: string; promptId?: string }
): Promise<string> {
    const provider = config.provider || 'openai';
    const temperature = config.temperature ?? 0.3; // Low temperature for consistency
    const maxTokens = config.maxTokens ?? 1000;

    const startTime = Date.now();
    let inputTokens = 0;
    let outputTokens = 0;
    let success = true;
    let errorMessage: string | undefined;

    try {
        // Estimate input tokens (rough: ~4 chars per token)
        inputTokens = Math.ceil((input.length + SYSTEM_PROMPT.length) / 4);

        // Check credits if context provided
        if (context?.workspaceId) {
            const estimatedCredits = calculateCreditCost(inputTokens, maxTokens || 1000);
            const hasCredits = await checkCredits(context.workspaceId, estimatedCredits);
            
            if (!hasCredits) {
                throw new Error('Insufficient credits. Please purchase more credits to continue.');
            }
        }

        let result: string;
        switch (provider) {
            case 'openai':
                result = await generateWithOpenAI(input, config.model, temperature, maxTokens);
                break;
            case 'anthropic':
                result = await generateWithAnthropic(input, config.model, temperature, maxTokens);
                break;
            case 'google':
                result = await generateWithGoogle(input, config.model, temperature, maxTokens);
                break;
            case 'cohere':
                result = await generateWithCohere(input, config.model, temperature, maxTokens);
                break;
            case 'local':
                result = await generateWithLocal(input, config.model, temperature, maxTokens);
                break;
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }

        // Estimate output tokens
        outputTokens = Math.ceil(result.length / 4);

        // Log usage and deduct credits
        if (context?.workspaceId && context?.userId) {
            await logUsageAndDeductCredits({
                workspaceId: context.workspaceId,
                userId: context.userId,
                type: UsageType.LLM_GENERATION,
                inputTokens,
                outputTokens,
                latencyMs: Date.now() - startTime,
                success: true,
                metadata: {
                    provider,
                    model: config.model || 'default',
                    promptId: context.promptId,
                },
            });
        }

        return result;
    } catch (error) {
        success = false;
        errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Log failed attempt
        if (context?.workspaceId && context?.userId) {
            try {
                await logUsageAndDeductCredits({
                    workspaceId: context.workspaceId,
                    userId: context.userId,
                    type: UsageType.LLM_GENERATION,
                    inputTokens,
                    outputTokens: 0,
                    latencyMs: Date.now() - startTime,
                    success: false,
                    errorMessage,
                    metadata: {
                        provider,
                        model: config.model || 'default',
                    },
                });
            } catch (logError) {
                console.error('Failed to log error usage:', logError);
            }
        }

        throw error;
    }
}

// OpenAI implementation
async function generateWithOpenAI(
    input: string,
    model?: string,
    temperature?: number,
    maxTokens?: number
): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('OPENAI_API_KEY not configured. Please add it to your .env.local file.');
    }

    const openai = new OpenAI({ apiKey });

    try {
        const completion = await openai.chat.completions.create({
            model: model || LLM_PROVIDERS.openai.defaultModel,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: input },
            ],
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
        });

        return completion.choices[0]?.message?.content || '{}';
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Anthropic implementation
async function generateWithAnthropic(
    input: string,
    model?: string,
    temperature?: number,
    maxTokens?: number
): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured. Please add it to your .env.local file.');
    }

    const anthropic = new Anthropic({ apiKey });

    try {
        const message = await anthropic.messages.create({
            model: model || LLM_PROVIDERS.anthropic.defaultModel,
            max_tokens: maxTokens || 1000,
            temperature,
            messages: [
                {
                    role: 'user',
                    content: `${SYSTEM_PROMPT}\n\nUser input: ${input}`,
                },
            ],
        });

        const content = message.content[0];
        if (content.type === 'text') {
            return content.text;
        }

        return '{}';
    } catch (error) {
        console.error('Anthropic API error:', error);
        throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Google Gemini implementation
async function generateWithGoogle(
    input: string,
    model?: string,
    temperature?: number,
    maxTokens?: number
): Promise<string> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured. Please add it to your .env.local file.');
    }

    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);

        const geminiModel = genAI.getGenerativeModel({
            model: model || 'gemini-1.5-flash-latest',
            generationConfig: {
                temperature: temperature ?? 0.3,
                maxOutputTokens: maxTokens ?? 1000,
                responseMimeType: 'application/json',
            },
        });

        const prompt = `${SYSTEM_PROMPT}\n\nUser input: ${input}`;
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text || '{}';
    } catch (error) {
        console.error('Google Gemini API error:', error);
        throw new Error(`Google Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Cohere implementation (placeholder)
async function generateWithCohere(
    input: string,
    model?: string,
    temperature?: number,
    maxTokens?: number
): Promise<string> {
    // Placeholder for Cohere API
    throw new Error('Cohere provider not yet implemented. Please use OpenAI or Anthropic, or implement this provider.');

    // TODO: Implement with cohere-ai package
    // const apiKey = process.env.COHERE_API_KEY;
    // if (!apiKey) throw new Error('COHERE_API_KEY not configured');
    // ... implementation
}

// Local model implementation (placeholder)
async function generateWithLocal(
    input: string,
    model?: string,
    temperature?: number,
    maxTokens?: number
): Promise<string> {
    // Placeholder for local model (e.g., Ollama, LM Studio)
    throw new Error('Local model provider not yet implemented. Please use OpenAI or Anthropic, or implement this provider.');

    // TODO: Implement with local inference endpoint
    // const endpoint = process.env.LOCAL_MODEL_ENDPOINT || 'http://localhost:11434';
    // ... implementation
}

// Retry logic with exponential backoff
export async function generateWithRetry(
    input: string,
    config: Partial<LLMConfig> = {},
    maxRetries = 3
): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await generateStructure(input, config);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            if (attempt < maxRetries - 1) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error('Failed after retries');
}
