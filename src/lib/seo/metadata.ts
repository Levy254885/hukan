import type { Metadata } from 'next';
import { getSiteUrl, SITE_NAME, DEFAULT_LOCALE } from './config';
import type { Property } from '@/types';
import { formatPrice } from '@/lib/utils';

export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: 'website' | 'article';
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.image || absoluteUrl('/og-default.png');

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: url,
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: input.type || 'website',
      locale: DEFAULT_LOCALE,
      url,
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export function buildPropertyMetadata(property: Property): Metadata {
  const location = [property.location.area, property.location.county]
    .filter(Boolean)
    .join(', ');
  const price = formatPrice(property.price, property.currency, property.priceFrequency);
  const typeLabel = property.propertyType.replace(/_/g, ' ');
  const purposeLabel =
    property.purpose === 'rent'
      ? 'for rent'
      : property.purpose === 'buy'
        ? 'for sale'
        : property.purpose === 'land'
          ? 'land for sale'
          : 'commercial';

  const title = `${property.title} | ${price} | ${location}`;
  const description = truncate(
    `${typeLabel} ${purposeLabel} in ${location}. ${price}. ${property.description}`,
    160
  );
  const path = `/property/${property.slug}`;
  const image = property.images.find((i) => i.isPrimary)?.secureUrl || property.images[0]?.secureUrl;

  const meta = buildPageMetadata({
    title,
    description,
    path,
    image,
    keywords: [
      typeLabel,
      location,
      purposeLabel,
      'Kenya',
      property.location.county,
      property.location.area || '',
    ].filter(Boolean),
  });

  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: 'website',
    },
  };
}

export function buildSearchMetadata(filters: {
  purpose?: string;
  location?: string;
  q?: string;
}): Metadata {
  if (filters.q) {
    return buildPageMetadata({
      title: `Search results for “${filters.q}”`,
      description: `Properties matching “${filters.q}” on Hukan — Kenya’s property marketplace.`,
      path: `/search?q=${encodeURIComponent(filters.q)}`,
      noIndex: true, // faceted/query results — avoid thin duplicate indexation
    });
  }

  const purpose =
    filters.purpose === 'buy'
      ? 'for sale'
      : filters.purpose === 'rent'
        ? 'for rent'
        : filters.purpose === 'land'
          ? 'land'
          : filters.purpose === 'commercial'
            ? 'commercial property'
            : 'property';

  const place = filters.location ? ` in ${filters.location}` : ' in Kenya';
  const title = `Property ${purpose}${place}`;
  const description = `Browse ${purpose}${place}. Filter by price, bedrooms and amenities. Contact agents on WhatsApp via Hukan.`;

  // Index only clean location landings; generic /search stays noindex-ish when heavily filtered
  const noIndex = Boolean(filters.location) === false && !filters.purpose;

  return buildPageMetadata({
    title,
    description,
    path: `/search?${new URLSearchParams(
      Object.fromEntries(
        Object.entries({
          purpose: filters.purpose,
          location: filters.location,
        }).filter(([, v]) => v)
      ) as Record<string, string>
    ).toString()}`,
    noIndex,
  });
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}
