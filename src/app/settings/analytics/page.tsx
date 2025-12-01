'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FileText, Zap, TrendingUp, AlertCircle, Download } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  totalEvents: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCreditsUsed: number;
  avgLatencyMs: number;
  errorRate: number;
  errorCount: number;
  statsByType: Record<string, {
    count: number;
    inputTokens: number;
    outputTokens: number;
    creditsUsed: number;
  }>;
  dailyUsage: Record<string, {
    count: number;
    creditsUsed: number;
    inputTokens: number;
    outputTokens: number;
  }>;
}

interface WorkspaceInfo {
  creditsRemaining: number;
  creditsUsedMonthly: number;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const { currentWorkspace } = useWorkspace();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [promptCount, setPromptCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);

  useEffect(() => {
    if (!currentWorkspace?.id || !session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        // Fetch usage metrics
        const metricsRes = await fetch(
          `/api/usage/metrics?workspaceId=${currentWorkspace.id}&days=${days}`
        );

        if (metricsRes.status === 403) {
          setIsOwnerOrAdmin(false);
          setLoading(false);
          return;
        }

        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setAnalytics(data.stats);
          setWorkspace(data.workspace);
          setIsOwnerOrAdmin(true);
        }

        // Fetch member count
        const membersRes = await fetch(`/api/workspaces/${currentWorkspace.id}/members`);
        if (membersRes.ok) {
          const members = await membersRes.json();
          setMemberCount(members.length || 0);
        }

        // Fetch prompt count
        const promptsRes = await fetch(`/api/workspaces/${currentWorkspace.id}/prompts`);
        if (promptsRes.ok) {
          const prompts = await promptsRes.json();
          setPromptCount(prompts.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentWorkspace?.id, session?.user?.id, days]);

  const exportToCSV = () => {
    if (!analytics) return;

    const csvData = [
      ['Date', 'Events', 'Credits Used', 'Input Tokens', 'Output Tokens'],
      ...Object.entries(analytics.dailyUsage).map(([date, data]) => [
        date,
        data.count,
        data.creditsUsed,
        data.inputTokens,
        data.outputTokens,
      ]),
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${currentWorkspace?.name}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!currentWorkspace) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Please select a workspace to view analytics.
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

  if (!isOwnerOrAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
              <p className="text-center text-lg font-medium">
                Analytics Access Restricted
              </p>
              <p className="text-center text-muted-foreground">
                Only workspace owners and admins can view analytics.
              </p>
              <Link
                href="/usage"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                View Your Personal Usage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const costPerMember = memberCount > 0 && workspace
    ? (workspace.creditsUsedMonthly / memberCount).toFixed(0)
    : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspace Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights for {currentWorkspace.name}
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

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <p className="text-xs text-muted-foreground">
              Workspace collaborators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promptCount}</div>
            <p className="text-xs text-muted-foreground">
              Created in workspace
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
              {workspace?.creditsUsedMonthly.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Member</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{costPerMember} credits</div>
            <p className="text-xs text-muted-foreground">
              Average monthly usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Overview */}
      {analytics && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Type</CardTitle>
                <CardDescription>Distribution of operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.statsByType).map(([type, stats]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{type}</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.count} operations
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(stats.count / analytics.totalEvents) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium">
                          {stats.creditsUsed} credits
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System reliability and speed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Latency</span>
                  <span className="text-2xl font-bold">{analytics.avgLatencyMs}ms</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-2xl font-bold">
                    {((1 - analytics.errorRate) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Errors</span>
                  <span className="text-2xl font-bold text-red-600">
                    {analytics.errorCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Tokens</span>
                  <span className="text-2xl font-bold">
                    {((analytics.totalInputTokens + analytics.totalOutputTokens) / 1000).toFixed(1)}K
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage Trend</CardTitle>
              <CardDescription>Credits consumed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(analytics.dailyUsage)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .slice(-14) // Last 14 days
                  .map(([date, data]) => (
                    <div key={date} className="flex items-center gap-4">
                      <span className="text-sm w-24">{date}</span>
                      <div className="flex-1 h-8 bg-muted rounded overflow-hidden">
                        <div
                          className="h-full bg-primary flex items-center px-2"
                          style={{
                            width: `${Math.min((data.creditsUsed / Math.max(...Object.values(analytics.dailyUsage).map(d => d.creditsUsed))) * 100, 100)}%`,
                          }}
                        >
                          <span className="text-xs font-medium text-primary-foreground">
                            {data.creditsUsed} credits
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground w-20 text-right">
                        {data.count} ops
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
