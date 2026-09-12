'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getReports,
  updateReportStatus,
  type FraudReport,
} from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminFraudPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<FraudReport[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setReports(await getReports());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function setStatus(id: string, status: FraudReport['status']) {
    if (!user) return;
    await updateReportStatus(user.id, id, status);
    refresh();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Fraud & reports</h2>
        <p className="text-sm text-muted-foreground">
          User-submitted reports and moderation queue
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="font-medium">No reports</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{r.reason}</p>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs capitalize',
                        r.status === 'open'
                          ? 'bg-warning/10 text-warning'
                          : r.status === 'resolved'
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {r.status}
                    </span>
                  </div>
                  {r.details && (
                    <p className="mt-1 text-sm text-muted-foreground">{r.details}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.propertyId && (
                      <>
                        Property:{' '}
                        <Link href={`/admin/properties`} className="underline">
                          {r.propertyId}
                        </Link>
                        {' · '}
                      </>
                    )}
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                {(r.status === 'open' || r.status === 'reviewing') && (
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => setStatus(r.id, 'reviewing')}>
                      Reviewing
                    </Button>
                    <Button size="sm" onClick={() => setStatus(r.id, 'resolved')}>
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setStatus(r.id, 'dismissed')}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
