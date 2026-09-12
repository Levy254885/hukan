/**
 * Saved Properties Service
 * Stores relationships efficiently (not huge arrays on the user doc).
 * Demo: localStorage. Production: Firestore collection `savedProperties`.
 */

import type { Property } from '@/types';
import { getPropertyById } from './propertyService';

const STORAGE_KEY = 'hukan_saved_properties';

export interface SavedPropertyRecord {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string; // ISO
  notes?: string;
}

function loadAll(): SavedPropertyRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(records: SavedPropertyRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export async function getSavedPropertyIds(userId: string): Promise<string[]> {
  return loadAll()
    .filter((r) => r.userId === userId)
    .map((r) => r.propertyId);
}

export async function isPropertySaved(
  userId: string,
  propertyId: string
): Promise<boolean> {
  return loadAll().some(
    (r) => r.userId === userId && r.propertyId === propertyId
  );
}

export async function saveProperty(
  userId: string,
  propertyId: string,
  notes?: string
): Promise<void> {
  const all = loadAll();
  if (all.some((r) => r.userId === userId && r.propertyId === propertyId)) {
    return; // already saved
  }
  all.push({
    id: `sp_${Date.now()}`,
    userId,
    propertyId,
    createdAt: new Date().toISOString(),
    notes,
  });
  saveAll(all);
}

export async function unsaveProperty(
  userId: string,
  propertyId: string
): Promise<void> {
  saveAll(
    loadAll().filter(
      (r) => !(r.userId === userId && r.propertyId === propertyId)
    )
  );
}

export async function toggleSaveProperty(
  userId: string,
  propertyId: string
): Promise<boolean> {
  const saved = await isPropertySaved(userId, propertyId);
  if (saved) {
    await unsaveProperty(userId, propertyId);
    return false;
  }
  await saveProperty(userId, propertyId);
  return true;
}

/** Alias used by hooks */
export const toggleSavedProperty = toggleSaveProperty;

export async function getSavedProperties(
  userId: string
): Promise<Property[]> {
  const ids = await getSavedPropertyIds(userId);
  const properties: Property[] = [];
  for (const id of ids) {
    const p = await getPropertyById(id);
    if (p) properties.push(p);
  }
  // Most recently saved first
  const records = loadAll().filter((r) => r.userId === userId);
  properties.sort((a, b) => {
    const ra = records.find((r) => r.propertyId === a.id)?.createdAt || '';
    const rb = records.find((r) => r.propertyId === b.id)?.createdAt || '';
    return rb.localeCompare(ra);
  });
  return properties;
}

export async function getSavedCount(userId: string): Promise<number> {
  return (await getSavedPropertyIds(userId)).length;
}
