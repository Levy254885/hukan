/**
 * Recommendations based on recently viewed, saved properties, and searches.
 * Deterministic — no fabricated “AI” claims.
 */

import type { Property } from '@/types';
import { DEMO_PROPERTIES } from '@/lib/demo-data';
import { getRecentlyViewed } from './recentlyViewedService';
import { getSavedProperties } from './savedPropertyService';
import { getSavedSearches } from './savedSearchService';

export interface RecommendationSet {
  title: string;
  reason: string;
  properties: Property[];
}

function scoreProperty(
  candidate: Property,
  signals: {
    areas: Set<string>;
    types: Set<string>;
    purposes: Set<string>;
    bedrooms: number[];
    maxPrices: number[];
  }
): number {
  let score = 0;
  const area = candidate.location.area?.toLowerCase() || '';
  const county = candidate.location.county.toLowerCase();

  if (signals.areas.has(area) || signals.areas.has(county)) score += 3;
  if (signals.types.has(candidate.propertyType)) score += 2;
  if (signals.purposes.has(candidate.purpose)) score += 2;

  if (signals.bedrooms.length && candidate.bedrooms !== undefined) {
    const avg =
      signals.bedrooms.reduce((a, b) => a + b, 0) / signals.bedrooms.length;
    if (Math.abs(candidate.bedrooms - avg) <= 1) score += 2;
  }

  if (signals.maxPrices.length) {
    const max = Math.max(...signals.maxPrices);
    if (candidate.price <= max) score += 1;
  }

  if (candidate.featured) score += 1;
  if (candidate.verificationStatus === 'verified') score += 1;
  score += Math.min(candidate.views / 100, 2);

  return score;
}

export async function getRecommendations(
  userId: string | null,
  limit = 6
): Promise<RecommendationSet[]> {
  const published = DEMO_PROPERTIES.filter((p) => p.status === 'published');
  const sets: RecommendationSet[] = [];

  if (!userId) {
    // Anonymous: featured + popular areas
    const featured = published.filter((p) => p.featured).slice(0, limit);
    if (featured.length) {
      sets.push({
        title: 'Featured homes',
        reason: 'Highlighted listings across Kenya',
        properties: featured,
      });
    }
    const kilimani = published
      .filter((p) => p.location.area?.toLowerCase() === 'kilimani')
      .slice(0, limit);
    if (kilimani.length) {
      sets.push({
        title: 'Popular in Kilimani',
        reason: 'One of Nairobi’s most searched areas',
        properties: kilimani,
      });
    }
    return sets;
  }

  const [recent, saved, searches] = await Promise.all([
    getRecentlyViewed(userId, 10),
    getSavedProperties(userId),
    getSavedSearches(userId),
  ]);

  const signals = {
    areas: new Set<string>(),
    types: new Set<string>(),
    purposes: new Set<string>(),
    bedrooms: [] as number[],
    maxPrices: [] as number[],
  };

  for (const p of [...recent, ...saved]) {
    if (p.location.area) signals.areas.add(p.location.area.toLowerCase());
    signals.areas.add(p.location.county.toLowerCase());
    signals.types.add(p.propertyType);
    signals.purposes.add(p.purpose);
    if (p.bedrooms) signals.bedrooms.push(p.bedrooms);
  }

  for (const s of searches) {
    if (s.location) signals.areas.add(s.location.toLowerCase());
    signals.purposes.add(s.purpose);
    if (s.bedrooms) signals.bedrooms.push(s.bedrooms);
    if (s.maxPrice) signals.maxPrices.push(s.maxPrice);
    s.propertyTypes?.forEach((t) => signals.types.add(t));
  }

  const exclude = new Set([...recent, ...saved].map((p) => p.id));

  const ranked = published
    .filter((p) => !exclude.has(p.id))
    .map((p) => ({ p, score: scoreProperty(p, signals) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p)
    .slice(0, limit);

  if (recent.length > 0 && ranked.length > 0) {
    const area = recent[0].location.area || recent[0].location.county;
    sets.push({
      title: `Because you viewed homes in ${area}`,
      reason: 'Based on your recent activity — not sold to advertisers',
      properties: ranked,
    });
  } else if (ranked.length > 0) {
    sets.push({
      title: 'Recommended for you',
      reason: 'Based on your saves and searches',
      properties: ranked,
    });
  }

  // Always offer a clean fallback
  if (sets.length === 0) {
    sets.push({
      title: 'Featured properties',
      reason: 'Start exploring to get personalised picks',
      properties: published.filter((p) => p.featured).slice(0, limit),
    });
  }

  return sets;
}
