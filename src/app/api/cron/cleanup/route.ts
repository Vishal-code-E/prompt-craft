import { NextResponse } from 'next/server';
import { cleanupOldUsageEvents } from '@/lib/usage';

// This endpoint should be called by Vercel Cron or similar scheduler
// Configure in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/cleanup",
//     "schedule": "0 2 * * *"
//   }]
// }

export async function GET(req: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clean up usage events older than 90 days
    const deletedCount = await cleanupOldUsageEvents(90);

    console.log(`Cleanup job completed: ${deletedCount} usage events deleted`);

    return NextResponse.json({
      success: true,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Cleanup cron job failed:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
