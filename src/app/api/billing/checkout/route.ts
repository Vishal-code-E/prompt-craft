import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkWorkspaceAccess, MemberRole } from '@/lib/workspace';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

/**
 * POST /api/billing/checkout - Create Stripe checkout session
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { workspaceId, plan } = body;

    if (!workspaceId || !plan) {
      return NextResponse.json(
        { error: 'workspaceId and plan are required' },
        { status: 400 }
      );
    }

    // Check workspace access (must be owner or admin)
    const hasAccess = await checkWorkspaceAccess(
      user.id,
      workspaceId,
      MemberRole.ADMIN
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get or create Stripe customer
    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: user.id },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomer = await prisma.stripeCustomer.create({
        data: {
          userId: user.id,
          stripeCustomerId: customer.id,
        },
      });
    }

    // Get price ID from env
    const priceId =
      plan === 'PRO'
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_TEAM_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
      metadata: {
        workspaceId,
        userId: user.id,
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('POST /api/billing/checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
