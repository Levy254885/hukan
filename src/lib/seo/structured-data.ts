/**
 * JSON-LD structured data for Google rich results.
 * Uses schema.org types appropriate for real estate listings.
 */

import type { Property } from '@/types';
import { absoluteUrl } from './metadata';
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from './config';

export function organizationSchema() {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url,
    description: SITE_TAGLINE,
    logo: absoluteUrl('/icons/icon-512.png'),
    areaServed: {
      '@type': 'Country',
      name: 'Kenya',
    },
    sameAs: [] as string[],
  };
}

export function websiteSchema() {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    description: "Kenya's property marketplace",
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items: { name: string; path?: string; href?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path || item.href || '/'),
    })),
  };
}

/** Alias used by SEO landing pages */
export const breadcrumbListSchema = breadcrumbSchema;

export function collectionPageSchema(input: {
  name: string;
  description?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: input.url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}

export function propertyListingSchema(property: Property) {
  const url = absoluteUrl(`/property/${property.slug}`);
  const images = property.images.map((i) => i.secureUrl).filter(Boolean);
  const price = property.price;
  const availability =
    property.status === 'published'
      ? 'https://schema.org/InStock'
      : property.status === 'sold' || property.status === 'rented'
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/OutOfStock';

  const businessFunction =
    property.purpose === 'rent'
      ? 'https://schema.org/LeaseOut'
      : 'https://schema.org/Sell';

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url,
    datePosted: property.publishedAt?.toISOString?.() || property.createdAt?.toISOString?.(),
    image: images.length ? images : undefined,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: property.currency || 'KES',
      availability,
      businessFunction,
      url,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location.area || property.location.city,
      addressRegion: property.location.county,
      addressCountry: 'KE',
      streetAddress: property.location.street,
    },
    geo: property.location.coordinates
      ? {
          '@type': 'GeoCoordinates',
          latitude: property.location.coordinates.latitude,
          longitude: property.location.coordinates.longitude,
        }
      : undefined,
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: property.size
      ? {
          '@type': 'QuantitativeValue',
          value: property.size,
          unitCode: property.sizeUnit === 'sqft' ? 'FTK' : 'MTK',
        }
      : undefined,
  };
}

/** ItemList for SEO landing / search result pages */
export function itemListSchema(
  name: string,
  properties: Property[],
  listPath: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: absoluteUrl(listPath),
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/property/${p.slug}`),
      name: p.title,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

/** Serialize for <script type="application/ld+json"> */
export function jsonLdScript(data: object | object[]): string {
  return JSON.stringify(data);
}
