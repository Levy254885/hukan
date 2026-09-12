import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  SEO_LANDINGS,
  SEO_PRIORITY_PLACES,
  findLanding,
  findCounty,
  findArea,
  slugifyPlace,
  type SeoLandingDef,
} from '@/lib/seo/config';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getDemoProperties } from '@/lib/demo-data';
import { rankProperties } from '@/lib/seo/ranking';
import { collectionPageSchema, breadcrumbListSchema } from '@/lib/seo/structured-data';

interface Props {
  params: Promise<{ segments: string[] }>;
}

interface ResolvedSeo {
  county: string;
  countySlug: string;
  area?: string;
  areaSlug?: string;
  landing: SeoLandingDef;
  placeLabel: string;
  path: string;
}

function resolveSegments(segments: string[]): ResolvedSeo | null {
  if (segments.length === 2) {
    const [countySlug, intentSlug] = segments;
    const county = findCounty(countySlug);
    const landing = findLanding(intentSlug);
    if (!county || !landing) return null;
    return {
      county,
      countySlug,
      landing,
      placeLabel: county,
      path: `/${countySlug}/${intentSlug}`,
    };
  }

  if (segments.length === 3) {
    const [countySlug, areaSlug, intentSlug] = segments;
    const place = findArea(countySlug, areaSlug);
    const landing = findLanding(intentSlug);
    if (!place || !landing) return null;
    return {
      county: place.county,
      countySlug,
      area: place.area,
      areaSlug,
      landing,
      placeLabel: `${place.area}, ${place.county}`,
      path: `/${countySlug}/${areaSlug}/${intentSlug}`,
    };
  }

  return null;
}

export async function generateStaticParams() {
  const params: { segments: string[] }[] = [];

  for (const place of SEO_PRIORITY_PLACES) {
    const countySlug = slugifyPlace(place.county);
    for (const landing of SEO_LANDINGS) {
      params.push({ segments: [countySlug, landing.slug] });
      for (const area of place.areas) {
        params.push({
          segments: [countySlug, slugifyPlace(area), landing.slug],
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params;
  const resolved = resolveSegments(segments);
  if (!resolved) return { title: 'Properties in Kenya' };

  const { landing, placeLabel, path } = resolved;
  return buildPageMetadata({
    title: landing.titleTemplate(placeLabel),
    description: landing.descriptionTemplate(placeLabel),
    path,
  });
}

export default async function SeoLandingPage({ params }: Props) {
  const { segments } = await params;
  const resolved = resolveSegments(segments);
  if (!resolved) notFound();

  const { county, countySlug, area, landing, placeLabel, path } = resolved;
  const title = landing.h1Template(placeLabel);
  const description = landing.descriptionTemplate(placeLabel);

  const all = getDemoProperties();
  let filtered = all.filter((p) => p.status === 'published');

  filtered = filtered.filter(
    (p) => p.location.county.toLowerCase() === county.toLowerCase()
  );

  if (area) {
    filtered = filtered.filter(
      (p) =>
        (p.location.area || '').toLowerCase().includes(area.toLowerCase()) ||
        (p.location.city || '').toLowerCase().includes(area.toLowerCase())
    );
  }

  if (landing.purpose === 'buy') {
    filtered = filtered.filter((p) => p.purpose === 'buy');
  } else if (landing.purpose === 'rent') {
    filtered = filtered.filter((p) => p.purpose === 'rent');
  } else if (landing.purpose === 'land') {
    filtered = filtered.filter((p) => p.purpose === 'land');
  } else if (landing.purpose === 'commercial') {
    filtered = filtered.filter((p) => p.purpose === 'commercial');
  }

  if (landing.propertyTypes?.length) {
    filtered = filtered.filter((p) =>
      landing.propertyTypes!.includes(p.propertyType)
    );
  }

  const ranked = rankProperties(filtered, {
    purpose: landing.purpose === 'land' || landing.purpose === 'commercial' ? undefined : landing.purpose,
    location: area || county,
  })
    .slice(0, 24)
    .map((r) => r.property);

  const crumbs = [
    { name: 'Home', path: '/' },
    {
      name: county,
      path: `/${countySlug}/property-for-sale`,
    },
  ];
  if (area) {
    crumbs.push({ name: area, path });
  }
  crumbs.push({ name: landing.h1Template(placeLabel), path });

  return (
    <div className="hukan-section py-8">
      <JsonLd
        data={[
          breadcrumbListSchema(crumbs),
          collectionPageSchema({
            name: title,
            description,
            url: `https://hukan.co.ke${path}`,
          }),
        ]}
      />
      <Breadcrumbs items={crumbs} />
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
        <p className="mt-2 text-sm text-muted-foreground">{ranked.length} properties</p>
      </header>

      {ranked.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No listings match this area yet.</p>
          <Link
            href="/search"
            className="mt-4 inline-block font-medium text-primary hover:underline"
          >
            Browse all properties →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ranked.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}

      <section className="mt-12 rounded-xl border border-border bg-muted/40 p-6">
        <h2 className="text-lg font-semibold">Explore more</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/search" className="hukan-chip">
            All search
          </Link>
          <Link href={`/${countySlug}/property-for-sale`} className="hukan-chip">
            {county} for sale
          </Link>
          <Link href={`/${countySlug}/property-for-rent`} className="hukan-chip">
            {county} to rent
          </Link>
        </div>
      </section>
    </div>
  );
}
