'use client';

import Link from 'next/link';
import { useCompare } from '@/hooks/useCompare';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

const ROWS: { label: string; get: (p: import('@/types').Property) => string }[] = [
  {
    label: 'Price',
    get: (p) => formatPrice(p.price, p.currency, p.priceFrequency),
  },
  {
    label: 'Purpose',
    get: (p) => p.purpose,
  },
  {
    label: 'Type',
    get: (p) => p.propertyType.replace(/_/g, ' '),
  },
  {
    label: 'Location',
    get: (p) => [p.location.area, p.location.county].filter(Boolean).join(', '),
  },
  {
    label: 'Bedrooms',
    get: (p) => (p.bedrooms !== undefined ? String(p.bedrooms) : '—'),
  },
  {
    label: 'Bathrooms',
    get: (p) => (p.bathrooms !== undefined ? String(p.bathrooms) : '—'),
  },
  {
    label: 'Size',
    get: (p) =>
      p.size ? `${p.size} ${p.sizeUnit || 'sqm'}` : p.plotSize || '—',
  },
  {
    label: 'Parking',
    get: (p) => (p.parkingSpaces !== undefined ? String(p.parkingSpaces) : '—'),
  },
  {
    label: 'Verified',
    get: (p) => (p.verificationStatus === 'verified' ? 'Yes' : 'No'),
  },
  {
    label: 'Key amenities',
    get: (p) => {
      const a = p.amenities || {};
      const labels: string[] = [];
      if (a.parking) labels.push('Parking');
      if (a.dsq) labels.push('DSQ');
      if (a.swimmingPool) labels.push('Pool');
      if (a.gym) labels.push('Gym');
      if (a.gatedCommunity) labels.push('Gated');
      if (a.borehole) labels.push('Borehole');
      if (a.generator) labels.push('Generator');
      if (a.fibre) labels.push('Fibre');
      return labels.length ? labels.join(', ') : '—';
    },
  },
];

export default function ComparePage() {
  const { properties, count, clear, toggle } = useCompare();

  if (count < 2) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Compare properties</h1>
        <p className="mt-2 text-muted-foreground">
          Add at least two properties from search results to compare side by side.
        </p>
        <Link href="/search" className="mt-6 inline-block">
          <Button>Browse properties</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Compare</h1>
          <p className="text-sm text-muted-foreground">{count} properties</p>
        </div>
        <Button variant="outline" size="sm" onClick={clear}>
          Clear all
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="sticky left-0 bg-muted/40 px-4 py-3 font-medium">Feature</th>
              {properties.map((p) => (
                <th key={p.id} className="px-4 py-3 font-medium">
                  <Link href={`/property/${p.slug}`} className="hover:text-primary">
                    {p.title}
                  </Link>
                  <button
                    type="button"
                    className="mt-1 block text-xs text-muted-foreground hover:text-danger"
                    onClick={() => toggle(p.id)}
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ROWS.map((row) => (
              <tr key={row.label}>
                <td className="sticky left-0 bg-background px-4 py-3 font-medium text-muted-foreground">
                  {row.label}
                </td>
                {properties.map((p) => (
                  <td key={p.id} className="px-4 py-3 capitalize">
                    {row.get(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
