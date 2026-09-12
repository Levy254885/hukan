'use client';

import Link from 'next/link';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';

export default function SavedPropertiesPage() {
  const { properties, loading, count } = useSavedProperties();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Saved properties</h2>
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? 'property' : 'properties'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-lg font-medium">No saved properties yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            When you find a place you like, tap the heart icon to save it here.
          </p>
          <Link href="/search" className="mt-4 inline-block">
            <Button>Browse properties</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
