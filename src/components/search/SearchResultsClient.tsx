'use client';

import { useState } from 'react';
import { List, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import type { Property, SearchFilters } from '@/types';
import { PropertyCard } from '@/components/property/PropertyCard';
import { FilterPanel } from '@/components/search/FilterPanel';
import { MapView } from '@/components/map/MapView';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthProvider';
import { createSavedSearch } from '@/services/savedSearchService';
import { useRouter } from 'next/navigation';

interface SearchResultsClientProps {
  initialProperties: Property[];
  total: number;
  filters: SearchFilters;
}

type ViewMode = 'list' | 'split' | 'map';

export function SearchResultsClient({
  initialProperties,
  total,
  filters,
}: SearchResultsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const { user } = useAuth();
  const router = useRouter();

  async function handleSaveSearch() {
    if (!user) {
      router.push('/signin');
      return;
    }
    setSaveStatus('saving');
    try {
      await createSavedSearch(user.id, filters);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('idle');
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>

        <div className="hidden items-center gap-1 rounded-lg border border-border p-1 lg:flex">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'split' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'map' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MapIcon className="h-4 w-4" />
            Map
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveSearch}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saved' ? 'Search saved' : saveStatus === 'saving' ? 'Saving…' : 'Save search'}
          </Button>
          <p className="text-sm text-muted-foreground lg:hidden">
            {total} results
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border border-border bg-card p-4">
            <FilterPanel />
          </div>
        </aside>

        {(viewMode === 'list' || viewMode === 'split') && (
          <div
            className={cn(
              'space-y-4',
              viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-9'
            )}
          >
            {initialProperties.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
                <p className="text-lg font-medium text-foreground">No properties found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your filters or searching a different area.
                </p>
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'list' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
                )}
              >
                {initialProperties.map((property, i) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    priority={i < 3}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {(viewMode === 'map' || viewMode === 'split') && (
          <div
            className={cn(
              'sticky top-20 h-[calc(100vh-6rem)] overflow-hidden',
              viewMode === 'map' ? 'lg:col-span-9' : 'hidden lg:col-span-4 lg:block'
            )}
          >
            <MapView
              properties={initialProperties}
              height="100%"
              className="h-full"
            />
          </div>
        )}
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="text-sm text-muted-foreground"
              >
                Close
              </button>
            </div>
            <FilterPanel isMobile onClose={() => setMobileFiltersOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
