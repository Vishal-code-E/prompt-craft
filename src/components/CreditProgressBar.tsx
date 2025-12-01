'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Link from 'next/link';
import { Zap } from 'lucide-react';

interface CreditSummary {
  creditsRemaining: number;
  percentageRemaining: number;
  isLowCredit: boolean;
}

export function CreditProgressBar() {
  const { currentWorkspace } = useWorkspace();
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }

    const fetchCreditSummary = async () => {
      try {
        const response = await fetch(
          `/api/credits/summary?workspaceId=${currentWorkspace.id}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error('Failed to fetch credit summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditSummary();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchCreditSummary, 30000);

    return () => clearInterval(interval);
  }, [currentWorkspace?.id]);

  if (loading || !summary || !currentWorkspace) {
    return null;
  }

  // Determine color based on percentage remaining
  const getColorClass = () => {
    if (summary.percentageRemaining > 50) {
      return 'bg-green-500';
    } else if (summary.percentageRemaining > 20) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  const getTextColorClass = () => {
    if (summary.percentageRemaining > 50) {
      return 'text-green-600 dark:text-green-400';
    } else if (summary.percentageRemaining > 20) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <Link
      href="/usage"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
      title="View usage details"
    >
      <Zap className={`h-4 w-4 ${getTextColorClass()}`} />
      
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {summary.creditsRemaining.toLocaleString()} credits
          </span>
        </div>
        
        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getColorClass()}`}
            style={{ width: `${Math.min(summary.percentageRemaining, 100)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
