import type { MetadataRoute } from 'next';
import { DEMO_PROPERTIES } from '@/lib/demo-data';
import {
  SEO_LANDINGS,
  SEO_PRIORITY_PLACES,
  slugifyPlace,
  getSiteUrl,
} from '@/lib/seo/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/search',
    '/market',
    '/about',
    '/help',
    '/safety',
    '/privacy',
    '/terms',
    '/contact',
    '/cookies',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/search' ? 'hourly' : 'weekly',
    priority: path === '' ? 1 : path === '/search' || path === '/market' ? 0.9 : 0.5,
  }));

  const seoRoutes: MetadataRoute.Sitemap = [];
  for (const place of SEO_PRIORITY_PLACES) {
    const countySlug = slugifyPlace(place.county);
    for (const landing of SEO_LANDINGS) {
      seoRoutes.push({
        url: `${base}/${countySlug}/${landing.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.85,
      });
      for (const area of place.areas) {
        seoRoutes.push({
          url: `${base}/${countySlug}/${slugifyPlace(area)}/${landing.slug}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.8,
        });
      }
    }
  }

  const propertyRoutes: MetadataRoute.Sitemap = DEMO_PROPERTIES.filter(
    (p) => p.status === 'published'
  ).map((p) => ({
    url: `${base}/property/${p.slug}`,
    lastModified: p.updatedAt || p.publishedAt || now,
    changeFrequency: 'weekly' as const,
    priority: p.featured ? 0.85 : 0.75,
  }));

  return [...staticRoutes, ...seoRoutes, ...propertyRoutes];
}
