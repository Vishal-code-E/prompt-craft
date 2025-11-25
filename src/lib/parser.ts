import { IntermediateFormat } from '@/types/prompt';
import { validateIntermediateFormat } from './validator';

/**
 * Parses LLM response into intermediate structured format
 * Handles edge cases like malformed JSON, missing fields, etc.
 */
export function parseLLMResponse(response: string): IntermediateFormat {
    try {
        // Try to parse JSON directly
        const parsed = JSON.parse(response);

        // Validate and apply defaults
        const result = validateIntermediateFormat(parsed);

        if (result.success) {
            return result.data;
        } else {
            console.error('Validation errors:', (result.error as any).errors);
            // Return with defaults if validation fails
            return applyDefaults(parsed);
        }
    } catch (error) {
        console.error('JSON parse error:', error);

        // Try to extract JSON from markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                const result = validateIntermediateFormat(parsed);
                return result.success ? result.data : applyDefaults(parsed);
            } catch {
                // Fall through to default
            }
        }

        // Return minimal valid structure
        return getDefaultStructure();
    }
}

/**
 * Apply default values to partial data
 */
function applyDefaults(data: Partial<IntermediateFormat>): IntermediateFormat {
    return {
        main_task: data.main_task || '',
        rules: Array.isArray(data.rules) ? data.rules : [],
        genre: data.genre || 'fantasy',
        plot: data.plot || '',
        specifics: Array.isArray(data.specifics) ? data.specifics : [],
        moderation: {
            allow_vulgar: data.moderation?.allow_vulgar ?? false,
            allow_cussing: data.moderation?.allow_cussing ?? false,
        },
        limits: {
            min_words: data.limits?.min_words ?? 75,
            max_words: data.limits?.max_words ?? 125,
            max_chapters: data.limits?.max_chapters ?? 1,
            uniqueness: data.limits?.uniqueness ?? 100,
        },
    };
}

/**
 * Get default structure when parsing fails completely
 */
function getDefaultStructure(): IntermediateFormat {
    return {
        main_task: '',
        rules: [],
        genre: 'fantasy',
        plot: '',
        specifics: [],
        moderation: {
            allow_vulgar: false,
            allow_cussing: false,
        },
        limits: {
            min_words: 75,
            max_words: 125,
            max_chapters: 1,
            uniqueness: 100,
        },
    };
}

/**
 * Extract rules from natural language
 * Useful for additional processing beyond LLM extraction
 */
export function extractRules(text: string): string[] {
    const rules: string[] = [];
    const lowerText = text.toLowerCase();

    // Common rule patterns
    const rulePatterns = [
        { pattern: /no cuss(ing)?/i, rule: 'NO_CUSSING' },
        { pattern: /no (profanity|swearing)/i, rule: 'NO_CUSSING' },
        { pattern: /family[- ]friendly/i, rule: 'FAMILY_FRIENDLY' },
        { pattern: /no (violence|gore)/i, rule: 'NO_VIOLENCE' },
        { pattern: /high detail/i, rule: 'HIGH_DETAIL' },
        { pattern: /detailed/i, rule: 'HIGH_DETAIL' },
        { pattern: /creative/i, rule: 'HIGH_CREATIVITY' },
        { pattern: /unique/i, rule: 'HIGH_UNIQUENESS' },
        { pattern: /formal/i, rule: 'FORMAL_TONE' },
        { pattern: /casual/i, rule: 'CASUAL_TONE' },
    ];

    for (const { pattern, rule } of rulePatterns) {
        if (pattern.test(lowerText) && !rules.includes(rule)) {
            rules.push(rule);
        }
    }

    return rules;
}

/**
 * Extract numeric limits from text
 */
export function extractLimits(text: string): Partial<IntermediateFormat['limits']> {
    const limits: Partial<IntermediateFormat['limits']> = {};

    // Word count patterns: "100-150 words", "100 to 150 words", "about 100 words"
    const wordRangeMatch = text.match(/(\d+)\s*[-to]+\s*(\d+)\s*words?/i);
    if (wordRangeMatch) {
        limits.min_words = parseInt(wordRangeMatch[1]);
        limits.max_words = parseInt(wordRangeMatch[2]);
    } else {
        const singleWordMatch = text.match(/(?:about|around|approximately)?\s*(\d+)\s*words?/i);
        if (singleWordMatch) {
            const words = parseInt(singleWordMatch[1]);
            limits.min_words = Math.floor(words * 0.9);
            limits.max_words = Math.ceil(words * 1.1);
        }
    }

    // Chapter patterns
    const chapterMatch = text.match(/(\d+)\s*chapters?/i);
    if (chapterMatch) {
        limits.max_chapters = parseInt(chapterMatch[1]);
    }

    // Length descriptors
    if (/\b(short|brief|concise)\b/i.test(text)) {
        limits.min_words = limits.min_words || 50;
        limits.max_words = limits.max_words || 100;
    } else if (/\b(long|lengthy|extended)\b/i.test(text)) {
        limits.min_words = limits.min_words || 200;
        limits.max_words = limits.max_words || 500;
    } else if (/\b(medium|moderate)\b/i.test(text)) {
        limits.min_words = limits.min_words || 100;
        limits.max_words = limits.max_words || 200;
    }

    return limits;
}

/**
 * Detect genre from text
 */
export function detectGenre(text: string): string {
    const lowerText = text.toLowerCase();

    const genreKeywords: Record<string, string[]> = {
        'sci-fi': ['sci-fi', 'science fiction', 'space', 'robot', 'alien', 'futuristic', 'cyberpunk'],
        'fantasy': ['fantasy', 'magic', 'wizard', 'dragon', 'elf', 'dwarf', 'medieval'],
        'mystery': ['mystery', 'detective', 'crime', 'investigation', 'clue', 'whodunit'],
        'romance': ['romance', 'love', 'relationship', 'dating', 'romantic'],
        'horror': ['horror', 'scary', 'terror', 'ghost', 'monster', 'haunted'],
        'thriller': ['thriller', 'suspense', 'action', 'chase', 'espionage'],
        'adventure': ['adventure', 'quest', 'journey', 'exploration', 'treasure'],
        'comedy': ['comedy', 'funny', 'humor', 'hilarious', 'comic'],
        'drama': ['drama', 'dramatic', 'emotional', 'serious'],
    };

    for (const [genre, keywords] of Object.entries(genreKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return genre;
        }
    }

    return 'fantasy'; // Default
}
