import { NextRequest, NextResponse } from 'next/server';
import { detectGenre, extractRules, extractLimits } from '@/lib/parser';
import { validateClassifyRequest } from '@/lib/validator';
import { ClassifyResponse } from '@/types/prompt';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate request
        const validation = validateClassifyRequest(body);
        if (!validation.success) {
            return NextResponse.json<ClassifyResponse>(
                {
                    success: false,
                    error: `Validation error: ${validation.error.message}`,
                },
                { status: 400 }
            );
        }

        const { input } = validation.data;

        // Classify content type
        const type = classifyContentType(input);

        // Detect tone
        const tone = detectTone(input);

        // Detect genre
        const genre = detectGenre(input);

        // Determine complexity
        const complexity = determineComplexity(input);

        return NextResponse.json<ClassifyResponse>({
            success: true,
            type,
            tone,
            genre,
            complexity,
        });

    } catch (error) {
        console.error('Unexpected error in /api/classify:', error);
        return NextResponse.json<ClassifyResponse>(
            {
                success: false,
                error: 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}

/**
 * Classify content type
 */
function classifyContentType(text: string): string {
    const lowerText = text.toLowerCase();

    if (/\b(story|tale|narrative|fiction)\b/i.test(lowerText)) {
        return 'story';
    }

    if (/\b(article|blog|post|essay)\b/i.test(lowerText)) {
        return 'article';
    }

    if (/\b(ad|advertisement|marketing|promotion)\b/i.test(lowerText)) {
        return 'advertisement';
    }

    if (/\b(email|letter|message)\b/i.test(lowerText)) {
        return 'correspondence';
    }

    if (/\b(poem|poetry|verse)\b/i.test(lowerText)) {
        return 'poetry';
    }

    if (/\b(script|screenplay|dialogue)\b/i.test(lowerText)) {
        return 'script';
    }

    return 'general';
}

/**
 * Detect tone
 */
function detectTone(text: string): string {
    const lowerText = text.toLowerCase();

    const toneIndicators = [
        { tone: 'formal', keywords: ['formal', 'professional', 'business', 'academic'] },
        { tone: 'casual', keywords: ['casual', 'friendly', 'conversational', 'relaxed'] },
        { tone: 'humorous', keywords: ['funny', 'humorous', 'comedy', 'witty', 'hilarious'] },
        { tone: 'serious', keywords: ['serious', 'grave', 'solemn', 'important'] },
        { tone: 'dramatic', keywords: ['dramatic', 'intense', 'emotional', 'passionate'] },
        { tone: 'inspirational', keywords: ['inspiring', 'motivational', 'uplifting', 'encouraging'] },
        { tone: 'dark', keywords: ['dark', 'grim', 'sinister', 'ominous'] },
        { tone: 'lighthearted', keywords: ['lighthearted', 'cheerful', 'playful', 'upbeat'] },
    ];

    for (const { tone, keywords } of toneIndicators) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return tone;
        }
    }

    return 'neutral';
}

/**
 * Determine complexity based on input characteristics
 */
function determineComplexity(text: string): 'simple' | 'moderate' | 'complex' {
    const wordCount = text.split(/\s+/).length;
    const rules = extractRules(text);
    const limits = extractLimits(text);

    let complexityScore = 0;

    // Word count factor
    if (wordCount > 50) complexityScore += 2;
    else if (wordCount > 20) complexityScore += 1;

    // Rules factor
    complexityScore += rules.length;

    // Limits factor
    if (limits.min_words || limits.max_words) complexityScore += 1;
    if (limits.max_chapters && limits.max_chapters > 1) complexityScore += 1;

    // Multiple sentences/clauses
    const sentenceCount = text.split(/[.!?]+/).length;
    if (sentenceCount > 3) complexityScore += 1;

    // Complex vocabulary
    if (/\b(sophisticated|intricate|elaborate|nuanced|multifaceted)\b/i.test(text)) {
        complexityScore += 2;
    }

    // Determine final complexity
    if (complexityScore >= 6) return 'complex';
    if (complexityScore >= 3) return 'moderate';
    return 'simple';
}

// OPTIONS handler for CORS
export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}
