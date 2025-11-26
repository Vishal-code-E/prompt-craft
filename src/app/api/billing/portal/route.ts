import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/workspace';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

/**
 * POST /api/billing/portal - Create Stripe customer portal session
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    // Get Stripe customer
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: user.id },
    });

    if (!stripeCustomer) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('POST /api/billing/portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
