/**
 * Recently Viewed — capped list, sensible retention.
 */

import type { Property } from '@/types';
import { getPropertyById } from './propertyService';

const STORAGE_KEY = 'hukan_recently_viewed';
const MAX_ITEMS = 20;

interface ViewRecord {
  propertyId: string;
  viewedAt: string;
}

function load(userId: string): ViewRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return all[userId] || [];
  } catch {
    return [];
  }
}

function save(userId: string, records: ViewRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[userId] = records.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore quota errors
  }
}

export function trackView(userId: string | undefined, propertyId: string) {
  if (!userId) return;
  const existing = load(userId).filter((r) => r.propertyId !== propertyId);
  existing.unshift({ propertyId, viewedAt: new Date().toISOString() });
  save(userId, existing);
}

export async function getRecentlyViewed(
  userId: string | undefined,
  limit = 8
): Promise<Property[]> {
  if (!userId) return [];
  const records = load(userId).slice(0, limit);
  const props: Property[] = [];
  for (const r of records) {
    const p = await getPropertyById(r.propertyId);
    if (p) props.push(p);
  }
  return props;
}

export function clearRecentlyViewed(userId: string) {
  save(userId, []);
}
