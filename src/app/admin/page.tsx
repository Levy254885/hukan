'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPlatformMetrics, getAuditLog, type PlatformMetrics, type AuditEntry } from '@/services/adminService';
import { Button } from '@/components/ui/button';

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  useEffect(() => {
    getPlatformMetrics().then(setMetrics);
    getAuditLog(8).then(setAudit);
  }, []);

  if (!metrics) {
    return <p className="text-sm text-muted-foreground">Loading metrics…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Metric label="Total users" value={metrics.totalUsers} />
        <Metric label="Active users" value={metrics.activeUsers} />
        <Metric label="Total listings" value={metrics.totalListings} />
        <Metric label="Published" value={metrics.publishedListings} />
        <Metric label="Pending review" value={metrics.pendingListings} href="/admin/properties?status=pending_review" />
        <Metric label="Verified listings" value={metrics.verifiedListings} />
        <Metric label="Open reports" value={metrics.openReports} href="/admin/fraud" highlight={metrics.openReports > 0} />
        <Metric label="Agents" value={metrics.agents} href="/admin/agents" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Total views" value={metrics.totalViews} />
        <Metric label="Enquiries" value={metrics.totalEnquiries} />
        <Metric label="Featured" value={metrics.featuredListings} />
        <Metric label="Agencies" value={metrics.agencies} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/properties">
          <Button size="sm">Moderate properties</Button>
        </Link>
        <Link href="/admin/fraud">
          <Button size="sm" variant="outline">
            Review reports
          </Button>
        </Link>
        <Link href="/admin/verification">
          <Button size="sm" variant="outline">
            Verification queue
          </Button>
        </Link>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Recent admin actions</h2>
        {audit.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No audited actions yet. Approvals and suspensions will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border text-sm">
            {audit.map((a) => (
              <li key={a.id} className="flex justify-between gap-4 px-4 py-2">
                <span>
                  <span className="font-medium">{a.action}</span>{' '}
                  <span className="text-muted-foreground">
                    {a.targetType}/{a.targetId.slice(0, 12)}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={`rounded-lg border bg-card p-4 ${
        highlight ? 'border-warning/50 bg-warning/5' : 'border-border'
      } ${href ? 'transition-colors hover:border-primary/40' : ''}`}
    >
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
