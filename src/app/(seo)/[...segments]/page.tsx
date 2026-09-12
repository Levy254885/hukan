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

export async function generateStaticParams() {
  const params: { segments: string[] }[] = [];
  for (const landing of SEO_LANDINGS) {
    params.push({ segments: landing.path.split('/').filter(Boolean) });
  }
  for (const place of SEO_PRIORITY_PLACES) {
    const slug = slugifyPlace(place.name);
    params.push({ segments: [slug] });
    params.push({ segments: [slug, 'for-sale'] });
    params.push({ segments: [slug, 'to-rent'] });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params;
  const path = '/' + segments.join('/');
  const landing = findLanding(path);
  if (landing) {
    return buildPageMetadata({
      title: landing.title,
      description: landing.description,
      path,
    });
  }
  const county = findCounty(segments[0]);
  if (county) {
    const intent = segments[1];
    const label =
      intent === 'to-rent' ? 'to rent' : intent === 'for-sale' ? 'for sale' : 'properties';
    return buildPageMetadata({
      title: `Properties ${label} in ${county.name}`,
      description: `Browse houses, apartments and land ${label} in ${county.name} County, Kenya. Verified listings on Hukan.`,
      path,
    });
  }
  return { title: 'Properties in Kenya' };
}

export default async function SeoLandingPage({ params }: Props) {
  const { segments } = await params;
  const path = '/' + segments.join('/');
  let landing: SeoLandingDef | undefined = findLanding(path);
  let title = '';
  let description = '';
  let countyName = '';
  let areaName = '';
  let purpose: 'buy' | 'rent' | undefined;

  if (landing) {
    title = landing.h1;
    description = landing.description;
    countyName = landing.county || '';
    areaName = landing.area || '';
    purpose = landing.purpose;
  } else {
    const county = findCounty(segments[0]);
    if (!county) notFound();
    countyName = county.name;
    const intent = segments[1];
    if (intent === 'to-rent') purpose = 'rent';
    else if (intent === 'for-sale') purpose = 'buy';
    const label = purpose === 'rent' ? 'to rent' : purpose === 'buy' ? 'for sale' : '';
    title = `Properties ${label} in ${countyName}`;
    description = `Discover verified properties ${label} across ${countyName} County.`;
    const area = segments[2] ? findArea(segments[2]) : undefined;
    if (area) {
      areaName = area.name;
      title = `Properties ${label} in ${areaName}, ${countyName}`;
    }
  }

  const all = getDemoProperties();
  let filtered = all.filter((p) => p.status === 'published');
  if (countyName) {
    filtered = filtered.filter(
      (p) => p.location.county.toLowerCase() === countyName.toLowerCase()
    );
  }
  if (areaName) {
    filtered = filtered.filter(
      (p) =>
        (p.location.area || '').toLowerCase().includes(areaName.toLowerCase()) ||
        (p.location.city || '').toLowerCase().includes(areaName.toLowerCase())
    );
  }
  if (purpose === 'buy') {
    filtered = filtered.filter((p) => p.purpose === 'buy' || p.purpose === 'land');
  }
  if (purpose === 'rent') {
    filtered = filtered.filter((p) => p.purpose === 'rent');
  }

  const ranked = rankProperties(filtered, {
    purpose,
    location: areaName || countyName || undefined,
  })
    .slice(0, 24)
    .map((r) => r.property);

  const crumbs = [
    { name: 'Home', path: '/' },
    {
      name: countyName || 'Kenya',
      path: countyName ? `/${slugifyPlace(countyName)}` : '/search',
    },
  ];
  if (areaName) crumbs.push({ name: areaName, path });
  else if (purpose) {
    crumbs.push({ name: purpose === 'rent' ? 'To rent' : 'For sale', path });
  }

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
      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
        <p className="mt-2 text-sm text-muted-foreground">{ranked.length} properties</p>
      </header>

      {ranked.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No listings match this area yet.</p>
          <Link href="/search" className="mt-4 inline-block font-medium text-primary hover:underline">
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
          {countyName && (
            <>
              <Link href={`/${slugifyPlace(countyName)}/for-sale`} className="hukan-chip">
                {countyName} for sale
              </Link>
              <Link href={`/${slugifyPlace(countyName)}/to-rent`} className="hukan-chip">
                {countyName} to rent
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
