'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { getRecommendations, type RecommendationSet } from '@/services/recommendationService';
import { PropertyCard } from '@/components/property/PropertyCard';

export function RecommendationSection({
  limit = 4,
}: {
  title?: string;
  seedPropertyId?: string;
  limit?: number;
}) {
  const { user } = useAuth();
  const [sets, setSets] = useState<RecommendationSet[]>([]);

  useEffect(() => {
    getRecommendations(user?.id ?? null, limit).then(setSets);
  }, [user?.id, limit]);

  if (!sets.length) return null;

  return (
    <div className="space-y-12">
      {sets.map((set) => (
        <section key={set.title}>
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{set.title}</h2>
            <p className="text-sm text-muted-foreground">{set.reason}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {set.properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} priority={i < 2} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
