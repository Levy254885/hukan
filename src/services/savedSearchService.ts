/**
 * Saved Searches Service
 * Demo: localStorage. Production: Firestore `savedSearches`.
 */

import type { SearchFilters, PropertyPurpose } from '@/types';

function generateId(): string {
  return `ss_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type NotificationFrequency = 'instant' | 'daily' | 'weekly' | 'none';

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  purpose: PropertyPurpose;
  location?: string;
  propertyTypes?: string[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  keywords?: string[];
  notificationFrequency: NotificationFrequency;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastNotifiedAt?: string;
}

const STORAGE_KEY = 'hukan_saved_searches';

function loadAll(): SavedSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(records: SavedSearch[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function buildName(filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.location) parts.push(filters.location);
  if (filters.bedrooms) parts.push(`${filters.bedrooms}+ bed`);
  if (filters.purpose) parts.push(filters.purpose === 'rent' ? 'Rentals' : filters.purpose);
  if (filters.maxPrice) {
    const p = filters.maxPrice;
    parts.push(p >= 1_000_000 ? `under ${(p / 1_000_000).toFixed(1)}M` : `under ${(p / 1000).toFixed(0)}k`);
  }
  return parts.join(' · ') || 'My search';
}

export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  return loadAll()
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getSavedSearchById(
  userId: string,
  id: string
): Promise<SavedSearch | null> {
  return loadAll().find((s) => s.userId === userId && s.id === id) ?? null;
}

export async function createSavedSearch(
  userId: string,
  filters: SearchFilters,
  name?: string,
  notificationFrequency: NotificationFrequency = 'daily'
): Promise<SavedSearch> {
  const now = new Date().toISOString();
  const record: SavedSearch = {
    id: generateId(),
    userId,
    name: name || buildName(filters),
    purpose: filters.purpose || 'rent',
    location: filters.location,
    propertyTypes: filters.propertyTypes,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    keywords: filters.keywords,
    notificationFrequency,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  const all = loadAll();
  all.push(record);
  saveAll(all);
  return record;
}

export async function updateSavedSearch(
  userId: string,
  id: string,
  updates: Partial<
    Pick<
      SavedSearch,
      'name' | 'notificationFrequency' | 'isActive' | 'location' | 'minPrice' | 'maxPrice' | 'bedrooms'
    >
  >
): Promise<SavedSearch> {
  const all = loadAll();
  const idx = all.findIndex((s) => s.userId === userId && s.id === id);
  if (idx === -1) throw new Error('Saved search not found');
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  saveAll(all);
  return all[idx];
}

export async function deleteSavedSearch(userId: string, id: string): Promise<void> {
  saveAll(loadAll().filter((s) => !(s.userId === userId && s.id === id)));
}

export async function pauseSavedSearch(userId: string, id: string): Promise<void> {
  await updateSavedSearch(userId, id, { isActive: false });
}

export async function resumeSavedSearch(userId: string, id: string): Promise<void> {
  await updateSavedSearch(userId, id, { isActive: true });
}

/** Convert saved search back to URL search params */
export function savedSearchToQuery(search: SavedSearch): string {
  const params = new URLSearchParams();
  params.set('purpose', search.purpose);
  if (search.location) params.set('location', search.location);
  if (search.bedrooms) params.set('beds', String(search.bedrooms));
  if (search.minPrice) params.set('minPrice', String(search.minPrice));
  if (search.maxPrice) params.set('maxPrice', String(search.maxPrice));
  if (search.propertyTypes?.[0]) params.set('propertyType', search.propertyTypes[0]);
  if (search.keywords?.length) params.set('keywords', search.keywords.join(' '));
  return params.toString();
}
