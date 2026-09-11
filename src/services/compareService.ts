/**
 * Property comparison tray — max 3 properties, session + localStorage.
 */

import type { Property } from '@/types';
import { getPropertyById } from './propertyService';

const KEY = 'hukan_compare';
const MAX = 3;

function loadIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function saveIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
  window.dispatchEvent(new CustomEvent('hukan:compare-changed'));
}

export function getCompareIds(): string[] {
  return loadIds();
}

export function isInCompare(propertyId: string): boolean {
  return loadIds().includes(propertyId);
}

export function addToCompare(propertyId: string): { ok: boolean; message?: string } {
  const ids = loadIds();
  if (ids.includes(propertyId)) return { ok: true };
  if (ids.length >= MAX) {
    return { ok: false, message: `You can compare up to ${MAX} properties` };
  }
  saveIds([...ids, propertyId]);
  return { ok: true };
}

export function removeFromCompare(propertyId: string): void {
  saveIds(loadIds().filter((id) => id !== propertyId));
}

export function toggleCompare(propertyId: string): { inCompare: boolean; message?: string } {
  if (isInCompare(propertyId)) {
    removeFromCompare(propertyId);
    return { inCompare: false };
  }
  const result = addToCompare(propertyId);
  return { inCompare: result.ok, message: result.message };
}

export function clearCompare(): void {
  saveIds([]);
}

export async function getCompareProperties(): Promise<Property[]> {
  const ids = loadIds();
  const list: Property[] = [];
  for (const id of ids) {
    const p = await getPropertyById(id);
    if (p) list.push(p);
  }
  return list;
}
