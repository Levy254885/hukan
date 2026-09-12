/**
 * Property Service — Data Access Layer
 * UI components must call these functions, never Firestore directly.
 * Currently backed by demo data. Swap implementation to Firestore later.
 */

import type { Property, SearchFilters, SearchResult } from '@/types';
import { filterDemoProperties, getDemoProperties } from '@/lib/demo-data';
import { rankProperties } from '@/lib/seo/ranking';

export async function searchProperties(filters: SearchFilters = {}): Promise<SearchResult> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let results = filterDemoProperties({
    purpose: filters.purpose,
    location: filters.location || filters.area || filters.county,
    bedrooms: filters.bedrooms,
    propertyType: filters.propertyTypes?.[0],
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });

  switch (filters.sort) {
    case 'newest':
      results = [...results].sort(
        (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
      );
      break;
    case 'oldest':
      results = [...results].sort(
        (a, b) => (a.publishedAt?.getTime() ?? 0) - (b.publishedAt?.getTime() ?? 0)
      );
      break;
    case 'price_asc':
      results = [...results].sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      results = [...results].sort((a, b) => b.price - a.price);
      break;
    case 'size_desc':
      results = [...results].sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
      break;
    case 'relevance':
    default:
      results = rankProperties(results, filters).map((r) => r.property);
      break;
  }

  const total = results.length;
  const start = (page - 1) * limit;
  const paged = results.slice(start, start + limit);

  return {
    properties: paged,
    total,
    page,
    limit,
    hasMore: start + limit < total,
  };
}

export async function getPropertyById(id: string): Promise<Property | null> {
  return getDemoProperties().find((p) => p.id === id) ?? null;
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  return getDemoProperties().find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProperties(limit = 8): Promise<Property[]> {
  return getDemoProperties()
    .filter((p) => p.featured && p.status === 'published')
    .slice(0, limit);
}

export async function getRecentProperties(limit = 8): Promise<Property[]> {
  return [...getDemoProperties()]
    .filter((p) => p.status === 'published')
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
    .slice(0, limit);
}

export async function incrementViews(id: string): Promise<void> {
  void id;
}

export async function createProperty(
  _data: Partial<Property>,
  _userId: string
): Promise<string> {
  throw new Error('Not implemented — requires authenticated agent/owner + Firestore');
}

export async function updateProperty(
  _id: string,
  _data: Partial<Property>,
  _userId: string
): Promise<void> {
  throw new Error('Not implemented');
}
