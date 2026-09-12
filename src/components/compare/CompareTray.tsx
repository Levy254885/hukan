'use client';

import Link from 'next/link';
import { useCompare } from '@/hooks/useCompare';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function CompareTray() {
  const { count, properties, clear, toggle } = useCompare();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 md:bottom-4 border-t border-border/80 bg-background/90 p-3 shadow-lift backdrop-blur-xl md:left-1/2 md:right-auto md:w-full md:max-w-2xl md:-translate-x-1/2 md:rounded-xl md:border">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Compare ({count}/3)</span>
          {properties.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs"
            >
              <span className="max-w-[120px] truncate">{p.location.area || p.title}</span>
              <button
                type="button"
                aria-label="Remove"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => toggle(p.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear
          </Button>
          <Link href="/compare">
            <Button size="sm" disabled={count < 2}>
              Compare
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
