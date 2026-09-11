/**
 * Property Service — Data Access Layer
 * UI components must call these functions, never Firestore directly.
 * Demo mode: in-memory + localStorage seed from demo-data.
 */

import type { Property, SearchFilters, SearchResult } from '@/types';
import { getDemoProperties } from '@/lib/demo-data';
import { rankProperties } from '@/lib/seo/ranking';

const STORAGE_KEY = 'hukan_properties_v1';

function load(): Property[] {
  if (typeof window === 'undefined') return getDemoProperties();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Property[];
      // revive dates
      return parsed.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
        featuredUntil: p.featuredUntil ? new Date(p.featuredUntil) : null,
      }));
    }
  } catch {
    /* fall through */
  }
  const seed = getDemoProperties();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function save(list: Property[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const list = load();
  return list.find((p) => p.id === id) || null;
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const list = load();
  return list.find((p) => p.slug === slug) || null;
}

export async function searchProperties(filters: SearchFilters = {}): Promise<SearchResult> {
  let list = load().filter((p) => p.status === 'published');

  if (filters.purpose) {
    list = list.filter((p) => p.purpose === filters.purpose);
  }
  if (filters.county) {
    const c = filters.county.toLowerCase();
    list = list.filter((p) => p.location.county.toLowerCase() === c);
  }
  if (filters.location || filters.area) {
    const q = (filters.location || filters.area || '').toLowerCase();
    list = list.filter(
      (p) =>
        (p.location.area || '').toLowerCase().includes(q) ||
        (p.location.city || '').toLowerCase().includes(q) ||
        (p.location.estate || '').toLowerCase().includes(q)
    );
  }
  if (filters.minPrice != null) list = list.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) list = list.filter((p) => p.price <= filters.maxPrice!);
  if (filters.bedrooms != null) list = list.filter((p) => (p.bedrooms || 0) >= filters.bedrooms!);
  if (filters.bathrooms != null) list = list.filter((p) => (p.bathrooms || 0) >= filters.bathrooms!);
  if (filters.propertyTypes?.length) {
    list = list.filter((p) => filters.propertyTypes!.includes(p.propertyType));
  }
  if (filters.keywords?.length) {
    const kws = filters.keywords.map((k) => k.toLowerCase());
    list = list.filter((p) =>
      kws.some(
        (k) =>
          p.title.toLowerCase().includes(k) ||
          p.description.toLowerCase().includes(k) ||
          (p.keywords || []).some((pk) => pk.toLowerCase().includes(k))
      )
    );
  }

  // Ranking / sort
  const sort = filters.sort || 'recommended';
  if (sort === 'recommended' || sort === 'relevance') {
    list = rankProperties(list);
  } else if (sort === 'newest') {
    list = [...list].sort((a, b) => +new Date(b.publishedAt || b.createdAt) - +new Date(a.publishedAt || a.createdAt));
  } else if (sort === 'oldest') {
    list = [...list].sort((a, b) => +new Date(a.publishedAt || a.createdAt) - +new Date(b.publishedAt || b.createdAt));
  } else if (sort === 'price_asc') {
    list = [...list].sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list = [...list].sort((a, b) => b.price - a.price);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 24;
  const start = (page - 1) * limit;
  const slice = list.slice(start, start + limit);

  return {
    properties: slice,
    total: list.length,
    page,
    limit,
    hasMore: start + limit < list.length,
  };
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const list = load().filter((p) => p.status === 'published' && p.featured);
  return rankProperties(list).slice(0, limit);
}

export async function incrementViews(id: string): Promise<void> {
  const list = load();
  const idx = list.findIndex((p) => p.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], views: (list[idx].views || 0) + 1 };
    save(list);
  }
}
