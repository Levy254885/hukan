'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getSavedSearches,
  deleteSavedSearch,
  pauseSavedSearch,
  resumeSavedSearch,
  savedSearchToQuery,
  type SavedSearch,
} from '@/services/savedSearchService';
import { Button } from '@/components/ui/button';

export default function SavedSearchesPage() {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    const list = await getSavedSearches(user.id);
    setSearches(list);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [user]);

  async function handleDelete(id: string) {
    if (!user || !confirm('Delete this saved search?')) return;
    await deleteSavedSearch(user.id, id);
    refresh();
  }

  async function handleToggleActive(s: SavedSearch) {
    if (!user) return;
    if (s.isActive) await pauseSavedSearch(user.id, s.id);
    else await resumeSavedSearch(user.id, s.id);
    refresh();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Saved searches</h2>
        <p className="text-sm text-muted-foreground">
          Get notified when new matching properties are listed
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : searches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-lg font-medium">No saved searches yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Run a search, then save it to receive alerts for new listings.
          </p>
          <Link href="/search" className="mt-4 inline-block">
            <Button>Start a search</Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {searches.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground capitalize">
                  {s.purpose}
                  {s.location ? ` · ${s.location}` : ''}
                  {s.bedrooms ? ` · ${s.bedrooms}+ beds` : ''}
                  {s.maxPrice
                    ? ` · up to KES ${s.maxPrice.toLocaleString()}`
                    : ''}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Alerts: {s.isActive ? s.notificationFrequency : 'paused'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/search?${savedSearchToQuery(s)}`}>
                  <Button variant="outline" size="sm">
                    View results
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(s)}
                >
                  {s.isActive ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  onClick={() => handleDelete(s.id)}
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
