import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { logUsageAndDeductCredits, checkCredits, calculateCreditCost } from '@/lib/usage';
import { UsageType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      workspaceId,
      type,
      inputTokens,
      outputTokens,
      latencyMs,
      success,
      errorMessage,
      metadata,
    } = body;

    // Validate required fields
    if (!workspaceId || !type || inputTokens === undefined || outputTokens === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: workspaceId, type, inputTokens, outputTokens' },
        { status: 400 }
      );
    }

    // Validate usage type
    if (!Object.values(UsageType).includes(type)) {
      return NextResponse.json(
        { error: `Invalid usage type. Must be one of: ${Object.values(UsageType).join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate required credits
    const requiredCredits = calculateCreditCost(inputTokens, outputTokens);

    // Check if workspace has sufficient credits
    const hasCredits = await checkCredits(workspaceId, requiredCredits);
    if (!hasCredits) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          creditsRequired: requiredCredits,
          message: 'Your workspace has run out of credits. Please purchase more to continue.',
        },
        { status: 402 } // Payment Required
      );
    }

    // Log usage and deduct credits
    const usageEvent = await logUsageAndDeductCredits({
      workspaceId,
      userId: session.user.id,
      type,
      inputTokens,
      outputTokens,
      latencyMs,
      success,
      errorMessage,
      metadata,
    });

    return NextResponse.json({
      success: true,
      usageEvent: {
        id: usageEvent.id,
        creditsUsed: usageEvent.creditsUsed,
        createdAt: usageEvent.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error logging usage:', error);

    if (error.message === 'Insufficient credits') {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: 'Your workspace has run out of credits. Please purchase more to continue.',
        },
        { status: 402 }
      );
    }

    if (error.message === 'Workspace not found') {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to log usage', details: error.message },
      { status: 500 }
    );
  }
}
