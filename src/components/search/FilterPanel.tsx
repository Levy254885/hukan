'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PURPOSES = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
] as const;

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: 'studio', label: 'Studio' },
  { value: 'maisonette', label: 'Maisonette' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'residential_land', label: 'Residential Land' },
  { value: 'office', label: 'Office' },
  { value: 'shop', label: 'Shop' },
];

const BED_OPTIONS = [1, 2, 3, 4, 5];

const AMENITY_OPTIONS = [
  { key: 'parking', label: 'Parking' },
  { key: 'balcony', label: 'Balcony' },
  { key: 'garden', label: 'Garden' },
  { key: 'swimmingPool', label: 'Swimming Pool' },
  { key: 'gym', label: 'Gym' },
  { key: 'lift', label: 'Lift' },
  { key: 'dsq', label: 'DSQ' },
  { key: 'gatedCommunity', label: 'Gated Community' },
  { key: 'borehole', label: 'Borehole' },
  { key: 'generator', label: 'Generator' },
  { key: 'fibre', label: 'Fibre' },
  { key: 'petFriendly', label: 'Pet Friendly' },
  { key: 'furnished', label: 'Furnished' },
  { key: 'serviced', label: 'Serviced' },
];

interface FilterPanelProps {
  className?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

export function FilterPanel({ className, onClose, isMobile }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPurpose = searchParams.get('purpose') || 'rent';
  const currentLocation = searchParams.get('location') || '';
  const currentBeds = searchParams.get('beds') || '';
  const currentType = searchParams.get('propertyType') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || 'recommended';
  const currentKeywords = searchParams.get('keywords') || '';

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.delete('page');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    startTransition(() => {
      router.push(pathname);
      onClose?.();
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Purpose</h3>
        <div className="flex flex-wrap gap-2">
          {PURPOSES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => updateFilters({ purpose: p.value })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                currentPurpose === p.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="filter-location" className="mb-2 block text-sm font-semibold">
          Location
        </label>
        <input
          id="filter-location"
          type="text"
          placeholder="e.g. Kilimani, Karen, Ruaka"
          defaultValue={currentLocation}
          className="hukan-input"
          onBlur={(e) => updateFilters({ location: e.target.value || null })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateFilters({ location: (e.target as HTMLInputElement).value || null });
            }
          }}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Property Type</h3>
        <select
          value={currentType}
          onChange={(e) => updateFilters({ propertyType: e.target.value || null })}
          className="hukan-input"
        >
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Price (KES)</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentMinPrice}
            className="hukan-input"
            onBlur={(e) => updateFilters({ minPrice: e.target.value || null })}
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentMaxPrice}
            className="hukan-input"
            onBlur={(e) => updateFilters({ maxPrice: e.target.value || null })}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Bedrooms</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateFilters({ beds: null })}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm',
              !currentBeds
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:border-primary/50'
            )}
          >
            Any
          </button>
          {BED_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => updateFilters({ beds: String(n) })}
              className={cn(
                'rounded-md border px-3 py-1.5 text-sm',
                currentBeds === String(n)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {n}+
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="filter-keywords" className="mb-2 block text-sm font-semibold">
          Keywords
        </label>
        <input
          id="filter-keywords"
          type="text"
          placeholder="e.g. DSQ, borehole, sea view, near school"
          defaultValue={currentKeywords}
          className="hukan-input"
          onBlur={(e) => updateFilters({ keywords: e.target.value || null })}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Search descriptions and amenities
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Sort by</h3>
        <select
          value={currentSort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
          className="hukan-input"
        >
          <option value="recommended">Recommended</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="size_desc">Largest</option>
        </select>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Popular amenities</h3>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.slice(0, 8).map((a) => (
            <button
              key={a.key}
              type="button"
              className="hukan-chip !px-2.5 !py-1 !text-xs"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 border-t border-border pt-4">
        <Button variant="outline" className="flex-1" onClick={clearAll} disabled={isPending}>
          Clear all
        </Button>
        {isMobile && (
          <Button className="flex-1" onClick={onClose} disabled={isPending}>
            Show results
          </Button>
        )}
      </div>
    </div>
  );
}
