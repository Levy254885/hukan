'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { getSavedSearches } from '@/services/savedSearchService';
import { getRecentlyViewed } from '@/services/recentlyViewedService';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import type { Property } from '@/types';
import type { SavedSearch } from '@/services/savedSearchService';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { properties: saved, count: savedCount, loading: savedLoading } = useSavedProperties();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [recent, setRecent] = useState<Property[]>([]);

  useEffect(() => {
    if (!user) return;
    getSavedSearches(user.id).then(setSearches);
    getRecentlyViewed(user.id, 4).then(setRecent);
  }, [user]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Saved properties" value={savedCount} href="/dashboard/saved" />
        <StatCard label="Saved searches" value={searches.length} href="/dashboard/searches" />
        <StatCard label="Enquiries" value={0} href="/dashboard/enquiries" />
        <StatCard label="Viewings" value={0} href="/dashboard/viewings" />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Saved properties</h2>
          <Link href="/dashboard/saved" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {savedLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : saved.length === 0 ? (
          <EmptyBlock
            title="No saved properties yet"
            description="Tap the heart on any listing to save it here."
            actionLabel="Browse properties"
            actionHref="/search"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.slice(0, 3).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recently viewed</h2>
        </div>
        {recent.length === 0 ? (
          <EmptyBlock
            title="Nothing viewed yet"
            description="Properties you open will appear here."
            actionLabel="Start searching"
            actionHref="/search"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Saved searches</h2>
          <Link href="/dashboard/searches" className="text-sm font-medium text-primary hover:underline">
            Manage
          </Link>
        </div>
        {searches.length === 0 ? (
          <EmptyBlock
            title="No saved searches"
            description="Save a search from the results page to get alerts."
            actionLabel="Search properties"
            actionHref="/search"
          />
        ) : (
          <ul className="space-y-2">
            {searches.slice(0, 5).map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {s.purpose} · {s.isActive ? 'Alerts on' : 'Paused'}
                  </p>
                </div>
                <Link href={`/search?${new URLSearchParams({ purpose: s.purpose, ...(s.location ? { location: s.location } : {}), ...(s.bedrooms ? { beds: String(s.bedrooms) } : {}) }).toString()}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Link>
  );
}

function EmptyBlock({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Link href={actionHref} className="mt-4 inline-block">
        <Button variant="outline" size="sm">
          {actionLabel}
        </Button>
      </Link>
    </div>
  );
}
