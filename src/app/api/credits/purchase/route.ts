import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

// Credit pack offerings
const CREDIT_PACKS = {
  small: { credits: 5000, price: 10, priceId: process.env.STRIPE_PRICE_CREDITS_SMALL },
  medium: { credits: 15000, price: 25, priceId: process.env.STRIPE_PRICE_CREDITS_MEDIUM },
  large: { credits: 50000, price: 75, priceId: process.env.STRIPE_PRICE_CREDITS_LARGE },
  enterprise: { credits: 200000, price: 250, priceId: process.env.STRIPE_PRICE_CREDITS_ENTERPRISE },
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId, packSize } = body;

    if (!workspaceId || !packSize) {
      return NextResponse.json(
        { error: 'Missing required fields: workspaceId, packSize' },
        { status: 400 }
      );
    }

    // Validate pack size
    if (!CREDIT_PACKS[packSize as keyof typeof CREDIT_PACKS]) {
      return NextResponse.json(
        {
          error: `Invalid pack size. Must be one of: ${Object.keys(CREDIT_PACKS).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Check if user is owner or admin of workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Only workspace owners and admins can purchase credits' },
        { status: 403 }
      );
    }

    // Get workspace details
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Get or create Stripe customer
    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: session.user.id },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });

      stripeCustomer = await prisma.stripeCustomer.create({
        data: {
          userId: session.user.id,
          stripeCustomerId: customer.id,
        },
      });
    }

    const pack = CREDIT_PACKS[packSize as keyof typeof CREDIT_PACKS];

    // Create Stripe Checkout session for one-time payment
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pack.credits.toLocaleString()} Credits`,
              description: `Credit pack for ${workspace.name}`,
            },
            unit_amount: pack.price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        workspaceId,
        credits: pack.credits.toString(),
        packSize,
        userId: session.user.id,
        type: 'credit_purchase',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true&credits=${pack.credits}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      credits: pack.credits,
      price: pack.price,
    });
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve available credit packs
export async function GET() {
  return NextResponse.json({
    packs: Object.entries(CREDIT_PACKS).map(([key, pack]) => ({
      id: key,
      credits: pack.credits,
      price: pack.price,
      pricePerCredit: (pack.price / pack.credits).toFixed(4),
    })),
  });
}
