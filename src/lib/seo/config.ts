/**
 * Hukan SEO positioning configuration.
 * Primary market: Kenya (en-KE). Brand: trustworthy local marketplace.
 */

export const SITE_NAME = 'Hukan';
export const SITE_TAGLINE = 'Find a place that feels right';
export const DEFAULT_LOCALE = 'en_KE';
export const DEFAULT_LANG = 'en';

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://hukan.co.ke').replace(/\/$/, '');
}

/** Core brand keywords — used sparingly; prefer natural copy */
export const BRAND_KEYWORDS = [
  'property Kenya',
  'houses for sale Kenya',
  'apartments for rent Nairobi',
  'land for sale Kenya',
  'Kenya real estate',
  'Hukan',
] as const;

/**
 * High-intent SEO landing definitions.
 * Intentionally limited — no thousands of thin programmatic pages.
 */
export type SeoIntent =
  | 'property-for-sale'
  | 'property-for-rent'
  | 'apartments-for-sale'
  | 'apartments-for-rent'
  | 'houses-for-sale'
  | 'houses-for-rent'
  | 'land-for-sale'
  | 'commercial-for-rent'
  | 'commercial-for-sale';

export interface SeoLandingDef {
  slug: SeoIntent;
  purpose: 'buy' | 'rent' | 'land' | 'commercial';
  propertyTypes?: string[];
  titleTemplate: (place: string) => string;
  descriptionTemplate: (place: string) => string;
  h1Template: (place: string) => string;
}

export const SEO_LANDINGS: SeoLandingDef[] = [
  {
    slug: 'property-for-sale',
    purpose: 'buy',
    titleTemplate: (p) => `Property for Sale in ${p}`,
    descriptionTemplate: (p) =>
      `Browse verified houses, apartments and land for sale in ${p}. Compare prices, contact agents and request viewings on Hukan.`,
    h1Template: (p) => `Property for sale in ${p}`,
  },
  {
    slug: 'property-for-rent',
    purpose: 'rent',
    titleTemplate: (p) => `Property for Rent in ${p}`,
    descriptionTemplate: (p) =>
      `Find apartments, maisonettes and houses for rent in ${p}. Filter by price, bedrooms and amenities on Hukan.`,
    h1Template: (p) => `Property to rent in ${p}`,
  },
  {
    slug: 'apartments-for-rent',
    purpose: 'rent',
    propertyTypes: ['apartment', 'studio', 'bedsitter'],
    titleTemplate: (p) => `Apartments for Rent in ${p}`,
    descriptionTemplate: (p) =>
      `Apartments and flats to rent in ${p}. Updated listings with photos, prices in KES and direct agent contact.`,
    h1Template: (p) => `Apartments for rent in ${p}`,
  },
  {
    slug: 'apartments-for-sale',
    purpose: 'buy',
    propertyTypes: ['apartment', 'penthouse', 'studio'],
    titleTemplate: (p) => `Apartments for Sale in ${p}`,
    descriptionTemplate: (p) =>
      `Apartments for sale in ${p}. Explore prices, sizes and verified listings on Hukan.`,
    h1Template: (p) => `Apartments for sale in ${p}`,
  },
  {
    slug: 'houses-for-sale',
    purpose: 'buy',
    propertyTypes: ['bungalow', 'maisonette', 'townhouse', 'villa', 'mansion'],
    titleTemplate: (p) => `Houses for Sale in ${p}`,
    descriptionTemplate: (p) =>
      `Houses, maisonettes and villas for sale in ${p}. Search by area, price and features.`,
    h1Template: (p) => `Houses for sale in ${p}`,
  },
  {
    slug: 'houses-for-rent',
    purpose: 'rent',
    propertyTypes: ['bungalow', 'maisonette', 'townhouse', 'villa'],
    titleTemplate: (p) => `Houses for Rent in ${p}`,
    descriptionTemplate: (p) =>
      `Houses and maisonettes to rent in ${p}. Family homes with parking, DSQ and gated estates.`,
    h1Template: (p) => `Houses for rent in ${p}`,
  },
  {
    slug: 'land-for-sale',
    purpose: 'land',
    propertyTypes: ['residential_land', 'commercial_land', 'agricultural_land'],
    titleTemplate: (p) => `Land for Sale in ${p}`,
    descriptionTemplate: (p) =>
      `Plots and land for sale in ${p}. Residential, commercial and agricultural parcels with title information where available.`,
    h1Template: (p) => `Land for sale in ${p}`,
  },
  {
    slug: 'commercial-for-rent',
    purpose: 'commercial',
    propertyTypes: ['office', 'shop', 'retail', 'warehouse'],
    titleTemplate: (p) => `Commercial Property for Rent in ${p}`,
    descriptionTemplate: (p) =>
      `Offices, shops and warehouses to rent in ${p}. Commercial space for businesses on Hukan.`,
    h1Template: (p) => `Commercial property for rent in ${p}`,
  },
  {
    slug: 'commercial-for-sale',
    purpose: 'commercial',
    propertyTypes: ['office', 'shop', 'building', 'warehouse'],
    titleTemplate: (p) => `Commercial Property for Sale in ${p}`,
    descriptionTemplate: (p) =>
      `Commercial property for sale in ${p}. Offices, retail and investment buildings.`,
    h1Template: (p) => `Commercial property for sale in ${p}`,
  },
];

/** Priority counties/areas for sitemap + internal links (not exhaustive thin pages) */
export const SEO_PRIORITY_PLACES: { county: string; areas: string[] }[] = [
  {
    county: 'Nairobi',
    areas: [
      'Kilimani',
      'Westlands',
      'Karen',
      'Lavington',
      'Kileleshwa',
      'Runda',
      'Parklands',
      'South B',
      'South C',
      'Donholm',
    ],
  },
  {
    county: 'Kiambu',
    areas: ['Ruaka', 'Thika', 'Ruiru', 'Kiambu Town', 'Limuru'],
  },
  {
    county: 'Mombasa',
    areas: ['Nyali', 'Bamburi', 'Mombasa CBD'],
  },
  {
    county: 'Nakuru',
    areas: ['Nakuru Town', 'Naivasha'],
  },
  {
    county: 'Kisumu',
    areas: ['Kisumu'],
  },
  {
    county: 'Uasin Gishu',
    areas: ['Eldoret'],
  },
  {
    county: 'Kajiado',
    areas: ['Kitengela', 'Ngong', 'Ongata Rongai'],
  },
  {
    county: 'Machakos',
    areas: ['Syokimau', 'Athi River', 'Machakos'],
  },
  {
    county: 'Kakamega',
    areas: ['Kakamega'],
  },
  {
    county: 'Kilifi',
    areas: ['Kilifi', 'Malindi'],
  },
];

export function slugifyPlace(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function findLanding(slug: string): SeoLandingDef | undefined {
  return SEO_LANDINGS.find((l) => l.slug === slug);
}

export function findCounty(slug: string): string | undefined {
  const hit = SEO_PRIORITY_PLACES.find((c) => slugifyPlace(c.county) === slug);
  return hit?.county;
}

export function findArea(countySlug: string, areaSlug: string): { county: string; area: string } | undefined {
  const county = SEO_PRIORITY_PLACES.find((c) => slugifyPlace(c.county) === countySlug);
  if (!county) return undefined;
  const area = county.areas.find((a) => slugifyPlace(a) === areaSlug);
  if (!area) return undefined;
  return { county: county.county, area };
}
