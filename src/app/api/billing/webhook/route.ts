import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction } from '@/lib/audit';
import { WorkspacePlan, SubscriptionStatus } from '@/lib/types';
import { addCreditsToWorkspace } from '@/lib/usage';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Helper to map Stripe status to our enum
function mapSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    'active': SubscriptionStatus.ACTIVE,
    'canceled': SubscriptionStatus.CANCELED,
    'incomplete': SubscriptionStatus.INCOMPLETE,
    'incomplete_expired': SubscriptionStatus.INCOMPLETE_EXPIRED,
    'past_due': SubscriptionStatus.PAST_DUE,
    'trialing': SubscriptionStatus.TRIALING,
    'unpaid': SubscriptionStatus.UNPAID,
  };
  return statusMap[stripeStatus] || SubscriptionStatus.ACTIVE;
}

/**
 * POST /api/billing/webhook - Handle Stripe webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { workspaceId, userId, plan, type, credits } = session.metadata || {};

        // Handle credit purchase
        if (type === 'credit_purchase' && workspaceId && userId && credits) {
          const creditAmount = parseInt(credits);
          
          await addCreditsToWorkspace(workspaceId, creditAmount);

          // Audit log for credit purchase
          await createAuditLog({
            workspaceId,
            userId,
            action: AuditAction.CREDITS_PURCHASED,
            metadata: {
              credits: creditAmount,
              amountPaid: session.amount_total ? session.amount_total / 100 : 0,
              sessionId: session.id,
            },
          });
        }
        // Handle subscription checkout
        else if (workspaceId && userId && plan && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Type assertion for Stripe subscription properties
          const subData = subscription as unknown as {
            id: string;
            current_period_start: number;
            current_period_end: number;
          };

          // Create subscription record
          await prisma.subscription.create({
            data: {
              workspaceId,
              stripeSubscriptionId: subData.id,
              plan: plan as WorkspacePlan,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: new Date(subData.current_period_start * 1000),
              currentPeriodEnd: new Date(subData.current_period_end * 1000),
            },
          });

          // Update workspace plan
          await prisma.workspace.update({
            where: { id: workspaceId },
            data: { plan: plan as WorkspacePlan },
          });

          // Audit log
          await createAuditLog({
            workspaceId,
            userId,
            action: AuditAction.PLAN_UPGRADED,
            metadata: {
              plan,
              subscriptionId: subscription.id,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Type assertion for Stripe subscription properties
        const subData = subscription as unknown as {
          id: string;
          status: string;
          current_period_start: number;
          current_period_end: number;
          cancel_at_period_end: boolean;
        };

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subData.id },
          data: {
            status: mapSubscriptionStatus(subData.status),
            currentPeriodStart: new Date(subData.current_period_start * 1000),
            currentPeriodEnd: new Date(subData.current_period_end * 1000),
            cancelAtPeriodEnd: subData.cancel_at_period_end,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (sub) {
          // Downgrade workspace to FREE
          await prisma.workspace.update({
            where: { id: sub.workspaceId },
            data: { plan: WorkspacePlan.FREE },
          });

          // Update subscription status
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: SubscriptionStatus.CANCELED },
          });

          // Audit log
          await createAuditLog({
            workspaceId: sub.workspaceId,
            userId: '', // No user context in webhook
            action: AuditAction.PLAN_DOWNGRADED,
            metadata: {
              plan: 'FREE',
              reason: 'subscription_canceled',
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('POST /api/billing/webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }
}
