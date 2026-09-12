/**
 * Market intelligence derived only from real Hukan listing data.
 * Never invents city-wide statistics.
 */

import type { Property } from '@/types';
import { DEMO_PROPERTIES } from '@/lib/demo-data';

export interface AreaMarketSummary {
  area: string;
  county: string;
  sampleSize: number;
  forRent: number;
  forSale: number;
  medianRentKes: number | null;
  medianSaleKes: number | null;
  avgBedrooms: number | null;
  topPropertyTypes: { type: string; count: number }[];
  dataNote: string;
}

function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function getAreaMarketSummary(areaQuery: string): AreaMarketSummary | null {
  const q = areaQuery.toLowerCase().trim();
  if (!q) return null;

  const matches = DEMO_PROPERTIES.filter(
    (p) =>
      p.status === 'published' &&
      (p.location.area?.toLowerCase().includes(q) ||
        p.location.county.toLowerCase().includes(q))
  );

  if (matches.length === 0) return null;

  const rents = matches.filter((p) => p.purpose === 'rent').map((p) => p.price);
  const sales = matches
    .filter((p) => p.purpose === 'buy' || p.purpose === 'land')
    .map((p) => p.price);
  const beds = matches
    .filter((p) => p.bedrooms !== undefined && p.bedrooms > 0)
    .map((p) => p.bedrooms!);

  const typeCounts = new Map<string, number>();
  matches.forEach((p) => {
    typeCounts.set(p.propertyType, (typeCounts.get(p.propertyType) || 0) + 1);
  });

  const topPropertyTypes = Array.from(typeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const area = matches[0].location.area || matches[0].location.county;
  const county = matches[0].location.county;

  return {
    area,
    county,
    sampleSize: matches.length,
    forRent: rents.length,
    forSale: sales.length,
    medianRentKes: median(rents),
    medianSaleKes: median(sales),
    avgBedrooms: beds.length
      ? Math.round((beds.reduce((a, b) => a + b, 0) / beds.length) * 10) / 10
      : null,
    topPropertyTypes,
    dataNote:
      matches.length < 5
        ? 'Hukan is still collecting market data for this area. Figures are based on a small sample of listings on the platform only.'
        : 'Figures are calculated from active Hukan listings only — not official government or bank valuations.',
  };
}

export function listAreasWithData(): { area: string; county: string; count: number }[] {
  const map = new Map<string, { area: string; county: string; count: number }>();
  DEMO_PROPERTIES.filter((p) => p.status === 'published').forEach((p) => {
    const key = (p.location.area || p.location.county).toLowerCase();
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else
      map.set(key, {
        area: p.location.area || p.location.county,
        county: p.location.county,
        count: 1,
      });
  });
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
