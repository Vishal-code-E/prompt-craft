'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface UsageEvent {
  id: string;
  type: string;
  creditsUsed: number;
  inputTokens: number;
  outputTokens: number;
  createdAt: string;
}

interface UsageStats {
  totalEvents: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCreditsUsed: number;
  recentEvents: UsageEvent[];
}

interface WorkspaceInfo {
  creditsRemaining: number;
  creditsUsedMonthly: number;
  alertThreshold: number;
  autoRefill: boolean;
}

export default function UsagePage() {
  const { currentWorkspace } = useWorkspace();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }

    const fetchUsageMetrics = async () => {
      try {
        const response = await fetch(
          `/api/usage/metrics?workspaceId=${currentWorkspace.id}&days=${days}`
        );

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setWorkspace(data.workspace);
        }
      } catch (error) {
        console.error('Failed to fetch usage metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageMetrics();
  }, [currentWorkspace?.id, days]);

  if (!currentWorkspace) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Please select a workspace to view usage statistics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const percentageRemaining = workspace
    ? Math.round((workspace.creditsRemaining / 1000) * 100)
    : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usage Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your workspace usage and credit consumption
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 rounded-md border bg-background"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <Link
            href="/settings/billing"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Purchase Credits
          </Link>
        </div>
      </div>

      {/* Credit Balance */}
      {workspace && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Credit Balance
            </CardTitle>
            <CardDescription>Current credit status for this workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {workspace.creditsRemaining.toLocaleString()} credits
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {percentageRemaining}% remaining
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      percentageRemaining > 50
                        ? 'bg-green-500'
                        : percentageRemaining > 20
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(percentageRemaining, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Used this month:</span>{' '}
                  <span className="font-medium">
                    {workspace.creditsUsedMonthly.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Auto-refill:</span>{' '}
                  <span className="font-medium">
                    {workspace.autoRefill ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {workspace.creditsRemaining <= workspace.alertThreshold && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Credits are running low. Consider purchasing more to avoid interruption.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Last {days} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCreditsUsed.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Last {days} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Input Tokens</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalInputTokens / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Last {days} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Output Tokens</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalOutputTokens / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Last {days} days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {stats && stats.recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your most recent usage events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentEvents.map((event: UsageEvent) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {event.creditsUsed} credits
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.inputTokens + event.outputTokens} tokens
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
