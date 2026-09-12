'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';
import { getListingQuota, type ListingQuota } from '@/services/subscriptionService';
import { getAgentMetrics, getAgentListings } from '@/services/listingService';
import type { AgentMetrics } from '@/services/listingService';
import type { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export default function ProfessionalOverviewPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [listings, setListings] = useState<Property[]>([]);
  const [quota, setQuota] = useState<ListingQuota | null>(null);

  useEffect(() => {
    if (!user) return;
    const agentId = user.role === 'agent' ? user.id : 'agent_001';
    getAgentMetrics(agentId).then(setMetrics);
    getAgentListings(agentId).then((l) => setListings(l.slice(0, 5)));
    getListingQuota(agentId).then(setQuota);
  }, [user]);

  if (!metrics) {
    return <p className="text-sm text-muted-foreground">Loading metrics…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Listings" value={metrics.totalListings} />
        <Metric label="Published" value={metrics.published} />
        <Metric label="Views" value={metrics.totalViews} />
        <Metric label="Enquiries" value={metrics.totalEnquiries} />
      </div>

      {quota && (
        <p className="text-sm text-muted-foreground">
          Plan: <span className="font-medium text-foreground">{quota.plan.name}</span>
          {quota.limit != null
            ? ` — ${quota.activeListings}/${quota.limit} listings used`
            : ' — unlimited listings'}
          {!quota.canPublish && (
            <>
              {' · '}
              <Link href="/professional/billing" className="font-medium text-primary hover:underline">
                Upgrade to Pro
              </Link>
            </>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {quota && !quota.canPublish ? (
          <Link href="/professional/billing">
            <Button variant="accent">Upgrade to post more</Button>
          </Link>
        ) : (
          <Link href="/list-property">
            <Button>Add property</Button>
          </Link>
        )}
        <Link href="/professional/listings">
          <Button variant="outline">Manage listings</Button>
        </Link>
        <Link href="/professional/leads">
          <Button variant="outline">View leads</Button>
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent listings</h2>
          <Link href="/professional/listings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {listings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="font-medium">No listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish your first property to start receiving leads.
            </p>
            <Link href="/list-property" className="mt-4 inline-block">
              <Button size="sm">Add property</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {listings.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(p.price, p.currency, p.priceFrequency)} ·{' '}
                    <span className="capitalize">{p.status.replace('_', ' ')}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p>{p.views} views</p>
                  <p>{p.enquiries} enquiries</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
