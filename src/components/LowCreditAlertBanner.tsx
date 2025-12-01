'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';

interface CreditSummary {
  creditsRemaining: number;
  percentageRemaining: number;
  isLowCredit: boolean;
}

export function LowCreditAlertBanner() {
  const { currentWorkspace } = useWorkspace();
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!currentWorkspace?.id) {
      return;
    }

    // Check if dismissed today
    const dismissedDate = localStorage.getItem('lowCreditAlertDismissed');
    const today = new Date().toDateString();
    
    if (dismissedDate === today) {
      setDismissed(true);
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
      }
    };

    fetchCreditSummary();
  }, [currentWorkspace?.id]);

  const handleDismiss = () => {
    const today = new Date().toDateString();
    localStorage.setItem('lowCreditAlertDismissed', today);
    setDismissed(true);
  };

  if (!summary?.isLowCredit || dismissed) {
    return null;
  }

  const isZeroCredits = summary.creditsRemaining === 0;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isZeroCredits
          ? 'bg-red-600'
          : 'bg-yellow-500'
      } text-white px-4 py-3 shadow-lg`}
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            {isZeroCredits ? (
              <p className="text-sm font-medium">
                <strong>Out of Credits!</strong> Your workspace has run out of credits. 
                All LLM operations are paused. Purchase credits to continue.
              </p>
            ) : (
              <p className="text-sm font-medium">
                <strong>Low Credits Warning!</strong> You have only{' '}
                {summary.creditsRemaining.toLocaleString()} credits remaining (
                {summary.percentageRemaining}%). Consider purchasing more to avoid interruption.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings/billing"
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isZeroCredits
                ? 'bg-white text-red-600 hover:bg-red-50'
                : 'bg-white text-yellow-600 hover:bg-yellow-50'
            }`}
          >
            Purchase Credits
          </Link>
          
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md hover:bg-white/20 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
