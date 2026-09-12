'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getAllPropertiesForAdmin,
  moderateProperty,
} from '@/services/adminService';
import type { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export default function AdminVerificationPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const all = await getAllPropertiesForAdmin();
    setQueue(
      all.filter(
        (p) =>
          p.verificationStatus !== 'verified' &&
          (p.status === 'published' || p.status === 'pending_review')
      )
    );
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function verify(id: string) {
    if (!user) return;
    setBusy(id);
    await moderateProperty(user.id, id, 'verify');
    await refresh();
    setBusy(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Verification queue</h2>
        <p className="text-sm text-muted-foreground">
          Properties awaiting verification badge
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : queue.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="font-medium">Queue is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            All eligible listings are verified
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {queue.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link href={`/property/${p.slug}`} className="font-medium hover:text-primary">
                  {p.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(p.price, p.currency, p.priceFrequency)} ·{' '}
                  {p.location.area}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  Status: {p.verificationStatus} · Listing: {p.status.replace('_', ' ')}
                </p>
              </div>
              <Button size="sm" disabled={busy === p.id} onClick={() => verify(p.id)}>
                Mark verified
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
