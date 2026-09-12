'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getAllPropertiesForAdmin,
  moderateProperty,
} from '@/services/adminService';
import type { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { formatPrice, cn } from '@/lib/utils';
import { Suspense } from 'react';

function PropertiesModeration() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState(statusFilter);

  async function refresh() {
    setLoading(true);
    const list = await getAllPropertiesForAdmin();
    setProperties(
      list.sort(
        (a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0)
      )
    );
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return properties;
    if (filter === 'featured') return properties.filter((p) => p.featured);
    if (filter === 'verified')
      return properties.filter((p) => p.verificationStatus === 'verified');
    return properties.filter((p) => p.status === filter);
  }, [properties, filter]);

  async function act(
    propertyId: string,
    action: Parameters<typeof moderateProperty>[2]
  ) {
    if (!user) return;
    setBusyId(propertyId);
    try {
      await moderateProperty(user.id, propertyId, action);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Properties</h2>
        <p className="text-sm text-muted-foreground">
          Approve, verify, feature or suspend listings
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['all', 'All'],
            ['pending_review', 'Pending'],
            ['published', 'Published'],
            ['suspended', 'Suspended'],
            ['verified', 'Verified'],
            ['featured', 'Featured'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
              filter === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="font-medium">No properties match this filter</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => (
            <li key={p.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/property/${p.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <StatusBadge status={p.status} />
                    {p.verificationStatus === 'verified' && (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                        Verified
                      </span>
                    )}
                    {p.featured && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatPrice(p.price, p.currency, p.priceFrequency)} ·{' '}
                    {p.location.area}, {p.location.county} ·{' '}
                    <span className="capitalize">{p.purpose}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    ID: {p.id} · {p.views} views · {p.enquiries} enquiries
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {p.status === 'pending_review' && (
                    <>
                      <Button
                        size="sm"
                        disabled={busyId === p.id}
                        onClick={() => act(p.id, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === p.id}
                        onClick={() => act(p.id, 'reject')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {p.status === 'published' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'suspend')}
                    >
                      Suspend
                    </Button>
                  )}
                  {p.status === 'suspended' && (
                    <Button
                      size="sm"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'approve')}
                    >
                      Reinstate
                    </Button>
                  )}
                  {p.verificationStatus !== 'verified' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'verify')}
                    >
                      Verify
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'unverify')}
                    >
                      Unverify
                    </Button>
                  )}
                  {!p.featured ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'feature')}
                    >
                      Feature
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'unfeature')}
                    >
                      Unfeature
                    </Button>
                  )}
                  {p.status === 'published' && p.purpose === 'rent' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'mark_rented')}
                    >
                      Mark rented
                    </Button>
                  )}
                  {p.status === 'published' && p.purpose === 'buy' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'mark_sold')}
                    >
                      Mark sold
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    disabled={busyId === p.id}
                    onClick={() => {
                      if (confirm('Archive this listing?')) act(p.id, 'archive');
                    }}
                  >
                    Archive
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    published: 'bg-success/10 text-success',
    pending_review: 'bg-warning/10 text-warning',
    rejected: 'bg-danger/10 text-danger',
    suspended: 'bg-danger/10 text-danger',
    sold: 'bg-muted text-muted-foreground',
    rented: 'bg-muted text-muted-foreground',
    archived: 'bg-muted text-muted-foreground',
    draft: 'bg-muted text-muted-foreground',
  };
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs capitalize',
        colors[status] || 'bg-muted text-muted-foreground'
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export default function AdminPropertiesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <PropertiesModeration />
    </Suspense>
  );
}
