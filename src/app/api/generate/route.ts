import { NextRequest, NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/llm';
import { parseLLMResponse } from '@/lib/parser';
import { normalizeToJSONOutput } from '@/lib/normalizer';
import { generateTOON } from '@/lib/toon';
import { validateGenerateRequest } from '@/lib/validator';
import { GenerateResponse } from '@/types/prompt';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate request
        const validation = validateGenerateRequest(body);
        if (!validation.success) {
            return NextResponse.json<GenerateResponse>(
                {
                    success: false,
                    error: `Validation error: ${validation.error.errors.map(e => e.message).join(', ')}`,
                },
                { status: 400 }
            );
        }

        const { input, provider, model } = validation.data;

        // Check if input is empty
        if (!input.trim()) {
            return NextResponse.json<GenerateResponse>(
                {
                    success: false,
                    error: 'Input cannot be empty',
                },
                { status: 400 }
            );
        }

        // Call LLM with retry logic
        let llmResponse: string;
        try {
            llmResponse = await generateWithRetry(input, {
                provider,
                model,
                temperature: 0.3,
                maxTokens: 1000,
            });
        } catch (error) {
            console.error('LLM generation error:', error);
            return NextResponse.json<GenerateResponse>(
                {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to generate structure',
                },
                { status: 500 }
            );
        }

        // Parse LLM response to intermediate format
        const intermediate = parseLLMResponse(llmResponse);

        // Normalize to final JSON output
        const jsonOutput = normalizeToJSONOutput(intermediate);

        // Generate TOON DSL
        const toonOutput = generateTOON(jsonOutput);

        // Return successful response
        return NextResponse.json<GenerateResponse>({
            success: true,
            json: jsonOutput,
            toon: toonOutput,
        });

    } catch (error) {
        console.error('Unexpected error in /api/generate:', error);
        return NextResponse.json<GenerateResponse>(
            {
                success: false,
                error: 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}
