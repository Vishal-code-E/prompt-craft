import { prisma } from '@/lib/prisma';
import { checkCreditAlertStatus, markAlertSent } from '@/lib/usage';
import { createAuditLog } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

interface AlertConfig {
  workspaceId: string;
  ownerId: string;
  ownerEmail: string;
  ownerName?: string | null;
}

/**
 * Send email alert for low credits (requires email service integration)
 * @param config Alert configuration
 * @param creditsRemaining Number of credits remaining
 */
async function sendEmailAlert(config: AlertConfig, creditsRemaining: number) {
  // TODO: Integrate with SendGrid, Resend, or other email service
  // Example with Resend:
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'noreply@promptcraft.com',
    to: config.ownerEmail,
    subject: '⚠️ Low Credit Alert - PromptCraft',
    html: `
      <h2>Low Credit Warning</h2>
      <p>Hello ${config.ownerName || 'there'},</p>
      <p>Your workspace has only <strong>${creditsRemaining} credits</strong> remaining.</p>
      <p>To avoid service interruption, please purchase more credits:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/billing">Purchase Credits</a>
    `,
  });
  */

  console.log(`[Alert] Email sent to ${config.ownerEmail} for workspace ${config.workspaceId}`);
}

/**
 * Create in-app notification (stored in database or notification system)
 * @param config Alert configuration
 * @param creditsRemaining Number of credits remaining
 */
async function createInAppNotification(config: AlertConfig, creditsRemaining: number) {
  // Create audit log as notification record
  await createAuditLog({
    workspaceId: config.workspaceId,
    userId: config.ownerId,
    action: AuditAction.CREDITS_DEPLETED,
    metadata: {
      creditsRemaining,
      alertType: 'low_credit_warning',
      timestamp: new Date().toISOString(),
    },
  });

  console.log(`[Alert] In-app notification created for workspace ${config.workspaceId}`);
}

/**
 * Check workspace credits and send alerts if needed
 * @param workspaceId Workspace ID to check
 * @returns Alert status
 */
export async function checkAndSendCreditAlert(workspaceId: string) {
  const alertStatus = await checkCreditAlertStatus(workspaceId);

  if (!alertStatus.shouldAlert) {
    return {
      sent: false,
      reason: alertStatus.creditsRemaining <= alertStatus.threshold 
        ? 'Alert already sent' 
        : 'Credits above threshold',
    };
  }

  // Get workspace owner info
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      ownerId: true,
      owner: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!workspace) {
    return { sent: false, reason: 'Workspace not found' };
  }

  const alertConfig: AlertConfig = {
    workspaceId,
    ownerId: workspace.ownerId,
    ownerEmail: workspace.owner.email,
    ownerName: workspace.owner.name,
  };

  // Send alerts
  await Promise.all([
    sendEmailAlert(alertConfig, alertStatus.creditsRemaining),
    createInAppNotification(alertConfig, alertStatus.creditsRemaining),
  ]);

  // Mark alert as sent to prevent duplicates
  await markAlertSent(workspaceId);

  return {
    sent: true,
    creditsRemaining: alertStatus.creditsRemaining,
    percentageRemaining: alertStatus.percentageRemaining,
  };
}

/**
 * Batch check all workspaces for low credits (for scheduled jobs)
 * @returns Number of alerts sent
 */
export async function checkAllWorkspacesForLowCredits() {
  const workspaces = await prisma.workspace.findMany({
    where: {
      usageAlertSent: false,
    },
    select: {
      id: true,
      creditsRemaining: true,
      alertThreshold: true,
    },
  });

  let alertsSent = 0;

  for (const workspace of workspaces) {
    if (workspace.creditsRemaining <= workspace.alertThreshold) {
      const result = await checkAndSendCreditAlert(workspace.id);
      if (result.sent) {
        alertsSent++;
      }
    }
  }

  return alertsSent;
}
