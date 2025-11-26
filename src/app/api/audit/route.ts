import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkWorkspaceAccess } from '@/lib/workspace';
import { getWorkspaceAuditLogs } from '@/lib/audit';

/**
 * GET /api/audit - Get audit logs for workspace
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    // Check workspace access
    const hasAccess = await checkWorkspaceAccess(user.id, workspaceId);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get audit logs
    const result = await getWorkspaceAuditLogs(workspaceId, page, pageSize);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/audit error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
