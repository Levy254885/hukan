'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getAgentListings,
  getAgentDrafts,
  deleteDraft,
  updateListingStatus,
  type ListingDraft,
} from '@/services/listingService';
import type { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { getListingQuota, type ListingQuota } from '@/services/subscriptionService';

export default function ProfessionalListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Property[]>([]);
  const [drafts, setDrafts] = useState<ListingDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'drafts'>('active');
  const [quota, setQuota] = useState<ListingQuota | null>(null);

  const agentId = user?.role === 'agent' ? user.id : 'agent_001';

  async function refresh() {
    if (!user) return;
    setLoading(true);
    const [l, d, q] = await Promise.all([
      getAgentListings(agentId),
      getAgentDrafts(agentId),
      getListingQuota(agentId),
    ]);
    setListings(l);
    setDrafts(d);
    setQuota(q);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [user]);

  async function handleStatus(id: string, status: Property['status']) {
    await updateListingStatus(agentId, id, status);
    refresh();
  }

  async function handleDeleteDraft(id: string) {
    if (!confirm('Delete this draft?')) return;
    await deleteDraft(agentId, id);
    refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Listings</h2>
          <p className="text-sm text-muted-foreground">
            {listings.length} published · {drafts.length} drafts
            {quota && (
              <>
                {' · '}
                Plan: {quota.plan.name}
                {quota.limit != null
                  ? ` (${quota.activeListings}/${quota.limit} listings)`
                  : ' (unlimited)'}
              </>
            )}
          </p>
        </div>
        {quota && !quota.canPublish ? (
          <Link href="/professional/billing">
            <Button variant="accent">Upgrade to post more</Button>
          </Link>
        ) : (
          <Link href="/list-property">
            <Button>Add property</Button>
          </Link>
        )}
      </div>

      {quota && !quota.canPublish && (
        <div className="mb-4 rounded-lg border border-warning/40 bg-warning/5 px-4 py-3 text-sm">
          Free plan limit reached ({quota.limit} listings).{' '}
          <Link href="/professional/billing" className="font-medium text-primary hover:underline">
            Subscribe to Pro — KES 500/mo or KES 50,000/yr
          </Link>{' '}
          for unlimited listings.
        </div>
      )}

      <div className="mb-4 flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setTab('active')}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            tab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          Active ({listings.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('drafts')}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            tab === 'drafts'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          Drafts ({drafts.length})
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tab === 'active' ? (
        listings.length === 0 ? (
          <Empty
            title="No listings yet"
            href="/list-property"
            action="Add your first property"
          />
        ) : (
          <ul className="space-y-3">
            {listings.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/property/${p.slug}`}
                    className="font-medium hover:text-primary"
                  >
                    {p.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(p.price, p.currency, p.priceFrequency)} ·{' '}
                    {p.location.area}, {p.location.county}
                  </p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    {p.status.replace('_', ' ')} · {p.views} views · {p.enquiries}{' '}
                    enquiries
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/property/${p.slug}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  {p.status === 'published' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatus(p.id, 'rented')}
                    >
                      Mark rented
                    </Button>
                  )}
                  {p.status === 'published' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatus(p.id, 'sold')}
                    >
                      Mark sold
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : drafts.length === 0 ? (
        <Empty title="No drafts" href="/list-property" action="Start a new listing" />
      ) : (
        <ul className="space-y-3">
          {drafts.map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{d.title || 'Untitled draft'}</p>
                <p className="text-sm text-muted-foreground">
                  Step {d.step} of 11 · Updated{' '}
                  {new Date(d.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/list-property?draft=${d.id}`}>
                  <Button size="sm">Continue</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  onClick={() => handleDeleteDraft(d.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Empty({
  title,
  href,
  action,
}: {
  title: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
      <p className="font-medium">{title}</p>
      <Link href={href} className="mt-4 inline-block">
        <Button size="sm">{action}</Button>
      </Link>
    </div>
  );
}
