import { JSONOutput } from '@/utils/buildJSON';

/**
 * Converts JSON output to TOON DSL format
 * TOON (Task-Oriented Object Notation) is a custom DSL for prompt representation
 */
export function generateTOON(json: JSONOutput): string {
    const lines: string[] = [];

    // Main structure
    lines.push('STORY {');

    // Genre
    if (json.storyConfig.genre) {
        const genreUpper = json.storyConfig.genre.toUpperCase().replace(/[- ]/g, '_');
        lines.push(`  GENRE: ${genreUpper}`);
    }

    // Task
    if (json.task) {
        lines.push(`  TASK: "${escapeString(json.task)}"`);
    }

    // Plot
    if (json.storyConfig.plot) {
        lines.push(`  PLOT: "${escapeString(json.storyConfig.plot)}"`);
    }

    // Length
    lines.push(`  LENGTH: ${json.limits.minWords}-${json.limits.maxWords}`);

    // Chapters
    if (json.limits.maxChapters > 1) {
        lines.push(`  CHAPTERS: ${json.limits.maxChapters}`);
    }

    // Uniqueness/Creativity
    const strictness = getStrictnessLevel(json.limits.uniqueness);
    lines.push(`  STRICTNESS: ${strictness}`);

    // Rules
    if (json.rules.length > 0) {
        lines.push('  RULES:');
        for (const rule of json.rules) {
            const ruleFormatted = formatRule(rule);
            lines.push(`    - ${ruleFormatted}`);
        }
    }

    // Specifics
    if (json.storyConfig.specifics.length > 0) {
        lines.push('  SPECIFICS:');
        for (const specific of json.storyConfig.specifics) {
            lines.push(`    - ${escapeString(specific)}`);
        }
    }

    // Moderation
    const moderationFlags = getModerationFlags(json.moderation);
    if (moderationFlags.length > 0) {
        lines.push('  MODERATION:');
        for (const flag of moderationFlags) {
            lines.push(`    - ${flag}`);
        }
    }

    lines.push('}');

    return lines.join('\n');
}

/**
 * Escape special characters in strings
 */
function escapeString(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

/**
 * Format rule to TOON constant style
 */
function formatRule(rule: string): string {
    // Convert to UPPER_SNAKE_CASE if it looks like a constant
    if (/^[A-Z_]+$/.test(rule)) {
        return rule;
    }

    // Otherwise, keep as quoted string
    return `"${escapeString(rule)}"`;
}

/**
 * Get strictness level from uniqueness value
 */
function getStrictnessLevel(uniqueness: number): string {
    if (uniqueness >= 90) return 'HIGH';
    if (uniqueness >= 70) return 'MEDIUM';
    if (uniqueness >= 50) return 'LOW';
    return 'MINIMAL';
}

/**
 * Get moderation flags
 */
function getModerationFlags(moderation: JSONOutput['moderation']): string[] {
    const flags: string[] = [];

    if (!moderation.allowCussing) {
        flags.push('NO_CUSSING');
    }

    if (!moderation.allowVulgar) {
        flags.push('NO_VULGAR');
    }

    if (!moderation.allowCussing && !moderation.allowVulgar) {
        flags.push('FAMILY_FRIENDLY');
    }

    return flags;
}

/**
 * Parse TOON back to JSON (inverse operation)
 * Useful for round-trip testing and TOON editing
 */
export function parseTOON(toon: string): Partial<JSONOutput> {
    const result: Partial<JSONOutput> = {
        task: '',
        rules: [],
        storyConfig: {
            genre: '',
            plot: '',
            specifics: [],
        },
        moderation: {
            allowVulgar: true,
            allowCussing: true,
        },
        limits: {
            minWords: 75,
            maxWords: 125,
            maxChapters: 1,
            uniqueness: 100,
        },
    };

    // Extract genre
    const genreMatch = toon.match(/GENRE:\s*([A-Z_]+)/);
    if (genreMatch) {
        result.storyConfig!.genre = genreMatch[1].toLowerCase().replace(/_/g, '-');
    }

    // Extract task
    const taskMatch = toon.match(/TASK:\s*"([^"]*)"/);
    if (taskMatch) {
        result.task = unescapeString(taskMatch[1]);
    }

    // Extract plot
    const plotMatch = toon.match(/PLOT:\s*"([^"]*)"/);
    if (plotMatch) {
        result.storyConfig!.plot = unescapeString(plotMatch[1]);
    }

    // Extract length
    const lengthMatch = toon.match(/LENGTH:\s*(\d+)-(\d+)/);
    if (lengthMatch) {
        result.limits!.minWords = parseInt(lengthMatch[1]);
        result.limits!.maxWords = parseInt(lengthMatch[2]);
    }

    // Extract chapters
    const chaptersMatch = toon.match(/CHAPTERS:\s*(\d+)/);
    if (chaptersMatch) {
        result.limits!.maxChapters = parseInt(chaptersMatch[1]);
    }

    // Extract strictness
    const strictnessMatch = toon.match(/STRICTNESS:\s*([A-Z]+)/);
    if (strictnessMatch) {
        result.limits!.uniqueness = getUniquenessFromStrictness(strictnessMatch[1]);
    }

    // Extract rules
    const rulesSection = toon.match(/RULES:\s*((?:\s*-\s*[^\n]+\n?)+)/);
    if (rulesSection) {
        const rules = rulesSection[1]
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('-'))
            .map(line => {
                const ruleMatch = line.match(/^-\s*(?:"([^"]+)"|([A-Z_]+))$/);
                return ruleMatch ? (ruleMatch[1] ? unescapeString(ruleMatch[1]) : ruleMatch[2]) : '';
            })
            .filter(Boolean);
        result.rules = rules;
    }

    // Extract specifics
    const specificsSection = toon.match(/SPECIFICS:\s*((?:\s*-\s*[^\n]+\n?)+)/);
    if (specificsSection) {
        const specifics = specificsSection[1]
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('-'))
            .map(line => {
                const match = line.match(/^-\s*"?([^"]+)"?$/);
                return match ? unescapeString(match[1]) : '';
            })
            .filter(Boolean);
        result.storyConfig!.specifics = specifics;
    }

    // Extract moderation
    const moderationSection = toon.match(/MODERATION:\s*((?:\s*-\s*[^\n]+\n?)+)/);
    if (moderationSection) {
        const flags = moderationSection[1].toLowerCase();
        result.moderation!.allowCussing = !flags.includes('no_cussing');
        result.moderation!.allowVulgar = !flags.includes('no_vulgar');
    }

    return result;
}

/**
 * Unescape string
 */
function unescapeString(str: string): string {
    return str
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
}

/**
 * Get uniqueness value from strictness level
 */
function getUniquenessFromStrictness(strictness: string): number {
    switch (strictness) {
        case 'HIGH': return 100;
        case 'MEDIUM': return 75;
        case 'LOW': return 50;
        case 'MINIMAL': return 25;
        default: return 100;
    }
}

/**
 * Validate TOON syntax
 */
export function validateTOON(toon: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!toon.trim().startsWith('STORY {')) {
        errors.push('TOON must start with "STORY {"');
    }

    if (!toon.trim().endsWith('}')) {
        errors.push('TOON must end with "}"');
    }

    // Check for required fields
    if (!toon.includes('GENRE:')) {
        errors.push('Missing required field: GENRE');
    }

    if (!toon.includes('LENGTH:')) {
        errors.push('Missing required field: LENGTH');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
