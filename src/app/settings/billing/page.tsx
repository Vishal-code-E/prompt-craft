'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function BillingSettings() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState('');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      // TODO: Get current workspace ID from session or context
      const response = await fetch(`/api/billing/subscription?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'PRO' | 'TEAM') => {
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, plan }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
    }
  };

  const handlePortal = async () => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open portal:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Billing Settings</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Billing Settings</h1>

        {subscription ? (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Plan:</span> {subscription.plan}
              </p>
              <p>
                <span className="font-medium">Status:</span> {subscription.status}
              </p>
              <p>
                <span className="font-medium">Renews:</span>{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
              {subscription.cancelAtPeriodEnd && (
                <p className="text-yellow-600">
                  ⚠️ Your subscription will be canceled at the end of the current period
                </p>
              )}
            </div>
            <div className="mt-6">
              <Button onClick={handlePortal}>Manage Subscription</Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">No Active Subscription</h2>
            <p className="text-gray-600 mb-6">
              You are currently on the FREE plan. Upgrade to unlock more features!
            </p>
            <div className="space-y-4">
              <Button onClick={() => handleUpgrade('PRO')} className="w-full">
                Upgrade to PRO - $29/month
              </Button>
              <Button onClick={() => handleUpgrade('TEAM')} variant="outline" className="w-full">
                Upgrade to TEAM - $99/month
              </Button>
            </div>
          </Card>
        )}

        {/* Pricing Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">PRO Plan</h3>
            <p className="text-2xl font-bold mb-4">$29/month</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ 500 prompts</li>
              <li>✓ Public sharing</li>
              <li>✓ Export integrations</li>
              <li>✓ Priority support</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">TEAM Plan</h3>
            <p className="text-2xl font-bold mb-4">$99/month</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Unlimited prompts</li>
              <li>✓ Team collaboration</li>
              <li>✓ Advanced permissions</li>
              <li>✓ Audit logs</li>
              <li>✓ Priority support</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
