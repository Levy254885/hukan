/**
 * Natural Language Search Service
 * Deterministic parser for queries like:
 * "3 bedroom apartment in Kilimani under 120k"
 * "House in Karen with a swimming pool and parking"
 * "Land in Kakamega under 3 million"
 *
 * Abstraction is ready for future AI integration without changing callers.
 */

import type { SearchFilters, PropertyPurpose, PropertyType } from '@/types';

export interface ParsedSearchQuery {
  filters: SearchFilters;
  confidence: number;
  originalQuery: string;
  unrecognizedTokens: string[];
}

const PURPOSE_KEYWORDS: Record<string, PropertyPurpose> = {
  buy: 'buy',
  sale: 'buy',
  sell: 'buy',
  purchase: 'buy',
  rent: 'rent',
  rental: 'rent',
  lease: 'rent',
  letting: 'rent',
  land: 'land',
  plot: 'land',
  commercial: 'commercial',
  office: 'commercial',
  shop: 'commercial',
  warehouse: 'commercial',
};

const TYPE_KEYWORDS: Record<string, PropertyType> = {
  apartment: 'apartment',
  apt: 'apartment',
  flat: 'apartment',
  bedsitter: 'bedsitter',
  bedsit: 'bedsitter',
  studio: 'studio',
  maisonette: 'maisonette',
  bungalow: 'bungalow',
  townhouse: 'townhouse',
  'town house': 'townhouse',
  villa: 'villa',
  penthouse: 'penthouse',
  duplex: 'duplex',
  mansion: 'mansion',
  house: 'bungalow',
  land: 'residential_land',
  plot: 'residential_land',
  office: 'office',
  shop: 'shop',
  warehouse: 'warehouse',
};

const AMENITY_KEYWORDS: Record<string, string> = {
  parking: 'parking',
  garage: 'parking',
  balcony: 'balcony',
  garden: 'garden',
  pool: 'swimmingPool',
  'swimming pool': 'swimmingPool',
  gym: 'gym',
  lift: 'lift',
  elevator: 'lift',
  dsq: 'dsq',
  'servant quarters': 'dsq',
  'staff quarters': 'dsq',
  cctv: 'cctv',
  gated: 'gatedCommunity',
  'gated community': 'gatedCommunity',
  borehole: 'borehole',
  generator: 'generator',
  solar: 'solar',
  fibre: 'fibre',
  fiber: 'fibre',
  furnished: 'furnished',
  serviced: 'serviced',
  'pet friendly': 'petFriendly',
  pets: 'petFriendly',
};

const LOCATION_HINTS = [
  'kilimani', 'westlands', 'karen', 'runda', 'lavington', 'kileleshwa',
  'ruaka', 'kiambu', 'nakuru', 'mombasa', 'kisumu', 'kakamega', 'eldoret',
  'thika', 'naivasha', 'nyeri', 'meru', 'kitengela', 'syokimau', 'athiriver',
  'parklands', 'spring valley', 'muthaiga', 'gigiri', 'rosslyn', 'ridgeways',
  'nairobi', 'kisii', 'machakos',
];

function parsePrice(token: string): number | null {
  const cleaned = token.replace(/[,kes\s]/gi, '').toLowerCase();
  const match = cleaned.match(/^(\d+(?:\.\d+)?)(k|m|million)?$/);
  if (!match) return null;
  let value = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix === 'k') value *= 1000;
  if (suffix === 'm' || suffix === 'million') value *= 1_000_000;
  return value;
}

export function parseNaturalLanguageQuery(query: string): ParsedSearchQuery {
  const original = query.trim();
  const lower = original.toLowerCase();
  const tokens = lower.split(/[\s,]+/).filter(Boolean);
  const unrecognized: string[] = [];

  const filters: SearchFilters = {
    limit: 20,
    page: 1,
    sort: 'relevance',
  };

  let confidence = 0.3;

  for (const [keyword, purpose] of Object.entries(PURPOSE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      filters.purpose = purpose;
      confidence += 0.15;
      break;
    }
  }
  if (!filters.purpose) filters.purpose = 'rent';

  const bedMatch = lower.match(/(\d+)\s*(?:bed(?:room)?s?|br)\b/);
  if (bedMatch) {
    filters.bedrooms = parseInt(bedMatch[1], 10);
    confidence += 0.2;
  }

  for (const [keyword, type] of Object.entries(TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      filters.propertyTypes = [type];
      confidence += 0.15;
      break;
    }
  }

  for (const loc of LOCATION_HINTS) {
    if (lower.includes(loc)) {
      filters.location = loc.charAt(0).toUpperCase() + loc.slice(1);
      confidence += 0.2;
      break;
    }
  }

  const underMatch = lower.match(/(?:under|below|max|up to|less than)\s*([\d,.]+(?:k|m|million)?)/);
  if (underMatch) {
    const price = parsePrice(underMatch[1]);
    if (price) {
      filters.maxPrice = price;
      confidence += 0.15;
    }
  }

  const fromMatch = lower.match(/(?:from|min|above|over)\s*([\d,.]+(?:k|m|million)?)/);
  if (fromMatch) {
    const price = parsePrice(fromMatch[1]);
    if (price) {
      filters.minPrice = price;
      confidence += 0.1;
    }
  }

  const amenities: Record<string, boolean> = {};
  for (const [keyword, key] of Object.entries(AMENITY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      amenities[key] = true;
      confidence += 0.05;
    }
  }
  if (Object.keys(amenities).length > 0) {
    filters.amenities = amenities;
  }

  const known = new Set([
    ...Object.keys(PURPOSE_KEYWORDS),
    ...Object.keys(TYPE_KEYWORDS),
    ...Object.keys(AMENITY_KEYWORDS),
    ...LOCATION_HINTS,
    'bedroom', 'bedrooms', 'bed', 'beds', 'br', 'under', 'below', 'max',
    'from', 'min', 'with', 'and', 'in', 'for', 'a', 'an', 'the', 'to',
  ]);
  for (const t of tokens) {
    if (!known.has(t) && !/^\d/.test(t) && t.length > 2) {
      unrecognized.push(t);
    }
  }
  if (unrecognized.length > 0) {
    filters.keywords = unrecognized;
  }

  return {
    filters,
    confidence: Math.min(confidence, 1),
    originalQuery: original,
    unrecognizedTokens: unrecognized,
  };
}

export class NaturalLanguageSearchService {
  parse(query: string): ParsedSearchQuery {
    return parseNaturalLanguageQuery(query);
  }
}
