/**
 * Hukan listing ranking model
 * -----------------------------
 * Used for in-product search ordering (not Google's algorithm).
 * Designed so paid placement cannot fully override relevance.
 *
 * Final score = relevance * 0.45
 *             + quality   * 0.25
 *             + trust     * 0.15
 *             + engagement* 0.10
 *             + freshness * 0.05
 *             + featuredBoost (capped)
 */

import type { Property, SearchFilters } from '@/types';

export interface RankBreakdown {
  propertyId: string;
  total: number;
  relevance: number;
  quality: number;
  trust: number;
  engagement: number;
  freshness: number;
  featuredBoost: number;
}

const WEIGHTS = {
  relevance: 0.45,
  quality: 0.25,
  trust: 0.15,
  engagement: 0.1,
  freshness: 0.05,
} as const;

/** Max additive boost for paid featured — keeps results useful */
const MAX_FEATURED_BOOST = 0.08;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

export function scoreRelevance(property: Property, filters: SearchFilters): number {
  let score = 0.5; // base when filters are weak

  if (filters.purpose && property.purpose === filters.purpose) score += 0.2;

  if (filters.location) {
    const loc = filters.location.toLowerCase();
    const hay = [
      property.location.area,
      property.location.city,
      property.location.county,
      property.location.estate,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (hay.includes(loc)) score += 0.25;
    else if (property.title.toLowerCase().includes(loc)) score += 0.1;
    else score -= 0.15;
  }

  if (filters.propertyTypes?.length) {
    if (filters.propertyTypes.includes(property.propertyType)) score += 0.15;
    else score -= 0.2;
  }

  if (filters.bedrooms != null) {
    const beds = property.bedrooms ?? 0;
    if (beds >= filters.bedrooms) score += 0.1;
    else score -= 0.15;
  }

  if (filters.minPrice != null && property.price < filters.minPrice) score -= 0.2;
  if (filters.maxPrice != null && property.price > filters.maxPrice) score -= 0.2;
  if (
    filters.minPrice != null &&
    filters.maxPrice != null &&
    property.price >= filters.minPrice &&
    property.price <= filters.maxPrice
  ) {
    score += 0.1;
  }

  if (filters.keywords?.length) {
    const corpus = tokenize(
      `${property.title} ${property.description} ${(property.keywords || []).join(' ')}`
    );
    const hits = filters.keywords.filter((k) =>
      corpus.some((t) => t.includes(k.toLowerCase()) || k.toLowerCase().includes(t))
    );
    score += Math.min(0.2, hits.length * 0.07);
  }

  if (filters.amenities) {
    const entries = Object.entries(filters.amenities).filter(([, v]) => v);
    if (entries.length) {
      const matched = entries.filter(([k]) => (property.amenities as Record<string, boolean>)?.[k]);
      score += (matched.length / entries.length) * 0.15;
    }
  }

  return clamp01(score);
}

export function scoreQuality(property: Property): number {
  let score = 0;
  const imageCount = property.images?.length ?? 0;
  score += Math.min(0.35, imageCount * 0.07);
  if (imageCount >= 5) score += 0.1;

  const descLen = property.description?.length ?? 0;
  if (descLen > 80) score += 0.15;
  if (descLen > 200) score += 0.1;

  if (property.bedrooms != null) score += 0.05;
  if (property.bathrooms != null) score += 0.05;
  if (property.size != null || property.plotSize) score += 0.1;
  if (property.location.coordinates) score += 0.1;

  const amenityCount = Object.values(property.amenities || {}).filter(Boolean).length;
  score += Math.min(0.15, amenityCount * 0.02);

  return clamp01(score);
}

export function scoreTrust(property: Property): number {
  let score = 0.3;
  if (property.verificationStatus === 'verified') score += 0.45;
  else if (property.verificationStatus === 'pending') score += 0.1;
  if (property.agentId) score += 0.1;
  if (property.agencyId) score += 0.1;
  if (property.status === 'published') score += 0.05;
  return clamp01(score);
}

export function scoreEngagement(property: Property): number {
  // Log-scaled so viral outliers don't dominate
  const views = Math.log10((property.views || 0) + 1) / 4; // ~0–1 for 0–10k
  const saves = Math.log10((property.saves || 0) + 1) / 3;
  const enquiries = Math.log10((property.enquiries || 0) + 1) / 2.5;
  return clamp01(views * 0.5 + saves * 0.3 + enquiries * 0.2);
}

export function scoreFreshness(property: Property): number {
  const ref = property.publishedAt || property.updatedAt || property.createdAt;
  if (!ref) return 0.3;
  const ageDays = (Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 3) return 1;
  if (ageDays <= 14) return 0.8;
  if (ageDays <= 45) return 0.55;
  if (ageDays <= 90) return 0.35;
  return 0.15;
}

export function scoreFeaturedBoost(property: Property): number {
  if (!property.featured) return 0;
  if (property.featuredUntil && new Date(property.featuredUntil) < new Date()) return 0;
  return MAX_FEATURED_BOOST;
}

export function rankProperty(property: Property, filters: SearchFilters): RankBreakdown {
  const relevance = scoreRelevance(property, filters);
  const quality = scoreQuality(property);
  const trust = scoreTrust(property);
  const engagement = scoreEngagement(property);
  const freshness = scoreFreshness(property);
  const featuredBoost = scoreFeaturedBoost(property);

  const total =
    relevance * WEIGHTS.relevance +
    quality * WEIGHTS.quality +
    trust * WEIGHTS.trust +
    engagement * WEIGHTS.engagement +
    freshness * WEIGHTS.freshness +
    featuredBoost;

  return {
    propertyId: property.id,
    total,
    relevance,
    quality,
    trust,
    engagement,
    freshness,
    featuredBoost,
  };
}

export function rankProperties(
  properties: Property[],
  filters: SearchFilters
): { property: Property; rank: RankBreakdown }[] {
  return properties
    .map((property) => ({ property, rank: rankProperty(property, filters) }))
    .sort((a, b) => b.rank.total - a.rank.total);
}

/**
 * Explain ranking for admin / debugging (not shown to end users by default).
 */
export function explainRank(rank: RankBreakdown): string {
  return [
    `total=${rank.total.toFixed(3)}`,
    `rel=${rank.relevance.toFixed(2)}`,
    `qual=${rank.quality.toFixed(2)}`,
    `trust=${rank.trust.toFixed(2)}`,
    `eng=${rank.engagement.toFixed(2)}`,
    `fresh=${rank.freshness.toFixed(2)}`,
    `feat=${rank.featuredBoost.toFixed(2)}`,
  ].join(' ');
}
