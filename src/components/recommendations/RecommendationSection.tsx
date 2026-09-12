'use client';

import { useEffect, useState } from 'react';
import { PropertyCard } from '@/components/property/PropertyCard';
import type { Property } from '@/types';
import { getRecommendations } from '@/services/recommendationService';

export function RecommendationSection({
  title = 'You may also like',
  seedPropertyId,
  limit = 4,
}: {
  title?: string;
  seedPropertyId?: string;
  limit?: number;
}) {
  const [items, setItems] = useState<Property[]>([]);

  useEffect(() => {
    getRecommendations({ seedPropertyId, limit }).then(setItems);
  }, [seedPropertyId, limit]);

  if (!items.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </section>
  );
}
