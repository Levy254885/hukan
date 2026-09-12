'use client';

/**
 * MapView — Provider-agnostic map component
 * Currently a high-quality placeholder that shows property pins conceptually.
 * Swap implementation to Mapbox / Google / Leaflet without changing callers.
 */

import { Map as MapIcon } from 'lucide-react';
import type { Property } from '@/types';
import { cn } from '@/lib/utils';

interface MapViewProps {
  properties: Property[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  height?: string;
}

export function MapView({
  properties,
  selectedId,
  onSelect,
  className,
  height = '100%',
}: MapViewProps) {
  const withCoords = properties.filter((p) => p.location.coordinates);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-muted',
        className
      )}
      style={{ height }}
    >
      <MapIcon className="h-10 w-10 text-muted-foreground" />
      <p className="mt-2 font-medium text-foreground">Map view</p>
      <p className="mt-1 max-w-xs px-4 text-center text-sm text-muted-foreground">
        Interactive map with clustering will load here.
        {withCoords.length > 0 && (
          <>
            {' '}
            {withCoords.length} propert{withCoords.length === 1 ? 'y' : 'ies'} have coordinates.
          </>
        )}
      </p>

      {/* Simple pin list for demo / accessibility */}
      {withCoords.length > 0 && (
        <ul className="mt-4 max-h-40 w-full max-w-xs space-y-1 overflow-y-auto px-4 text-left text-xs">
          {withCoords.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect?.(p.id)}
                className={cn(
                  'w-full truncate rounded px-2 py-1 text-left hover:bg-background',
                  selectedId === p.id && 'bg-primary/10 font-medium text-primary'
                )}
              >
                📍 {p.location.area} — {p.title.slice(0, 30)}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="absolute bottom-2 left-2 text-[10px] text-muted-foreground">
        Map provider abstraction ready (Mapbox / Google)
      </p>
    </div>
  );
}
