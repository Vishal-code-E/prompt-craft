import { IntermediateFormat } from '@/types/prompt';
import { JSONOutput } from '@/utils/buildJSON';

/**
 * Normalizes intermediate format to Phase 1 JSON schema
 * Maps field names and ensures compatibility with existing store structure
 */
export function normalizeToJSONOutput(intermediate: IntermediateFormat): JSONOutput {
    return {
        task: intermediate.main_task,
        rules: intermediate.rules,
        storyConfig: {
            genre: normalizeGenre(intermediate.genre),
            plot: intermediate.plot,
            specifics: intermediate.specifics,
        },
        moderation: {
            allowVulgar: intermediate.moderation.allow_vulgar,
            allowCussing: intermediate.moderation.allow_cussing,
        },
        limits: {
            minWords: ensureValidNumber(intermediate.limits.min_words, 1, 10000, 75),
            maxWords: ensureValidNumber(intermediate.limits.max_words, 1, 10000, 125),
            maxChapters: ensureValidNumber(intermediate.limits.max_chapters, 1, 100, 1),
            uniqueness: ensureValidNumber(intermediate.limits.uniqueness, 0, 100, 100),
        },
    };
}

/**
 * Normalize genre to standard values
 * Maps variations and synonyms to canonical genre names
 */
function normalizeGenre(genre: string): string {
    const genreMap: Record<string, string> = {
        // Sci-fi variations
        'science fiction': 'sci-fi',
        'scifi': 'sci-fi',
        'sf': 'sci-fi',
        'space opera': 'sci-fi',
        'cyberpunk': 'sci-fi',
        'steampunk': 'sci-fi',

        // Fantasy variations
        'high fantasy': 'fantasy',
        'urban fantasy': 'fantasy',
        'dark fantasy': 'fantasy',

        // Mystery variations
        'detective': 'mystery',
        'crime': 'mystery',
        'noir': 'mystery',
        'whodunit': 'mystery',

        // Romance variations
        'romantic': 'romance',
        'love story': 'romance',

        // Horror variations
        'scary': 'horror',
        'terror': 'horror',
        'supernatural': 'horror',

        // Thriller variations
        'suspense': 'thriller',
        'action': 'thriller',

        // Adventure variations
        'quest': 'adventure',
        'exploration': 'adventure',

        // Comedy variations
        'humor': 'comedy',
        'funny': 'comedy',
        'comic': 'comedy',

        // Drama variations
        'dramatic': 'drama',
    };

    const normalized = genre.toLowerCase().trim();
    return genreMap[normalized] || normalized;
}

/**
 * Ensure number is within valid range
 */
function ensureValidNumber(
    value: number,
    min: number,
    max: number,
    defaultValue: number
): number {
    if (typeof value !== 'number' || isNaN(value)) {
        return defaultValue;
    }

    return Math.max(min, Math.min(max, value));
}

/**
 * Extract and categorize rules from text
 */
export function categorizeRules(rules: string[]): {
    moderation: string[];
    style: string[];
    content: string[];
    other: string[];
} {
    const categorized = {
        moderation: [] as string[],
        style: [] as string[],
        content: [] as string[],
        other: [] as string[],
    };

    const moderationKeywords = ['cussing', 'profanity', 'vulgar', 'violence', 'gore', 'mature', 'family-friendly'];
    const styleKeywords = ['formal', 'casual', 'detailed', 'concise', 'creative', 'tone'];
    const contentKeywords = ['plot', 'character', 'setting', 'theme', 'genre'];

    for (const rule of rules) {
        const lowerRule = rule.toLowerCase();

        if (moderationKeywords.some(kw => lowerRule.includes(kw))) {
            categorized.moderation.push(rule);
        } else if (styleKeywords.some(kw => lowerRule.includes(kw))) {
            categorized.style.push(rule);
        } else if (contentKeywords.some(kw => lowerRule.includes(kw))) {
            categorized.content.push(rule);
        } else {
            categorized.other.push(rule);
        }
    }

    return categorized;
}

/**
 * Infer moderation settings from rules
 */
export function inferModerationFromRules(rules: string[]): {
    allowVulgar: boolean;
    allowCussing: boolean;
} {
    const lowerRules = rules.map(r => r.toLowerCase()).join(' ');

    const noCussing = /no (cuss|profanity|swearing)/i.test(lowerRules);
    const familyFriendly = /family[- ]friendly/i.test(lowerRules);
    const noVulgar = /no vulgar/i.test(lowerRules);

    return {
        allowVulgar: !noVulgar && !familyFriendly,
        allowCussing: !noCussing && !familyFriendly,
    };
}

/**
 * Merge multiple intermediate formats (useful for iterative refinement)
 */
export function mergeIntermediateFormats(
    base: IntermediateFormat,
    override: Partial<IntermediateFormat>
): IntermediateFormat {
    return {
        main_task: override.main_task ?? base.main_task,
        rules: override.rules ?? base.rules,
        genre: override.genre ?? base.genre,
        plot: override.plot ?? base.plot,
        specifics: override.specifics ?? base.specifics,
        moderation: {
            allow_vulgar: override.moderation?.allow_vulgar ?? base.moderation.allow_vulgar,
            allow_cussing: override.moderation?.allow_cussing ?? base.moderation.allow_cussing,
        },
        limits: {
            min_words: override.limits?.min_words ?? base.limits.min_words,
            max_words: override.limits?.max_words ?? base.limits.max_words,
            max_chapters: override.limits?.max_chapters ?? base.limits.max_chapters,
            uniqueness: override.limits?.uniqueness ?? base.limits.uniqueness,
        },
    };
}
