'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface AuditLog {
  id: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  user: {
    name: string;
    email: string;
  };
}

export default function ActivitySettings() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [workspaceId] = useState(''); // TODO: Get from context

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      const response = await fetch(
        `/api/audit?workspaceId=${workspaceId}&page=${page}&pageSize=20`
      );
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Activity Log</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Activity Log</h1>

        <Card className="p-6">
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity yet</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium capitalize">{formatAction(log.action)}</p>
                    <p className="text-sm text-gray-500">
                      by {log.user.name} ({log.user.email})
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer">
                          View details
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
