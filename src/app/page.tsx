import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getFeaturedProperties, getRecentProperties } from '@/services/propertyService';
import { RecommendationSection } from '@/components/recommendations/RecommendationSection';

const popularAreas = [
  { name: 'Kilimani', county: 'Nairobi', href: '/search?purpose=rent&location=Kilimani' },
  { name: 'Westlands', county: 'Nairobi', href: '/search?purpose=rent&location=Westlands' },
  { name: 'Karen', county: 'Nairobi', href: '/search?purpose=buy&location=Karen' },
  { name: 'Runda', county: 'Nairobi', href: '/search?purpose=buy&location=Runda' },
  { name: 'Lavington', county: 'Nairobi', href: '/search?purpose=rent&location=Lavington' },
  { name: 'Ruaka', county: 'Kiambu', href: '/search?purpose=rent&location=Ruaka' },
  { name: 'Kileleshwa', county: 'Nairobi', href: '/search?purpose=rent&location=Kileleshwa' },
  { name: 'Nakuru', county: 'Nakuru', href: '/search?purpose=rent&location=Nakuru' },
  { name: 'Mombasa', county: 'Mombasa', href: '/search?purpose=rent&location=Mombasa' },
  { name: 'Kisumu', county: 'Kisumu', href: '/search?purpose=rent&location=Kisumu' },
  { name: 'Kakamega', county: 'Kakamega', href: '/search?purpose=land&location=Kakamega' },
  { name: 'Eldoret', county: 'Uasin Gishu', href: '/search?purpose=rent&location=Eldoret' },
];

const propertyTypes = [
  { name: 'Apartments', href: '/search?propertyType=apartment', icon: '🏢' },
  { name: 'Houses', href: '/search?propertyType=bungalow', icon: '🏠' },
  { name: 'Villas', href: '/search?propertyType=villa', icon: '🏡' },
  { name: 'Townhouses', href: '/search?propertyType=townhouse', icon: '🏘️' },
  { name: 'Land', href: '/search?purpose=land', icon: '🌳' },
  { name: 'Offices', href: '/search?propertyType=office', icon: '🏛️' },
  { name: 'Shops', href: '/search?propertyType=shop', icon: '🏪' },
  { name: 'Bedsitters', href: '/search?propertyType=bedsitter', icon: '🛏️' },
];

export default async function HomePage() {
  const [featured, recent] = await Promise.all([
    getFeaturedProperties(4),
    getRecentProperties(4),
  ]);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/[0.06] via-muted/40 to-background">
        <div className="hukan-section relative py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Find a place that feels right.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Search homes, land and commercial property across Kenya.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {(['buy', 'rent', 'land', 'commercial'] as const).map((purpose) => (
                <Link
                  key={purpose}
                  href={`/search?purpose=${purpose}`}
                  className="rounded-full border border-border px-4 py-1.5 text-sm font-medium capitalize text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {purpose}
                </Link>
              ))}
            </div>

            <form action="/search" method="GET" className="grid gap-3 sm:grid-cols-12">
              <input type="hidden" name="purpose" value="rent" />
              <div className="sm:col-span-5">
                <label htmlFor="q" className="sr-only">
                  Search
                </label>
                <input
                  id="q"
                  name="q"
                  type="text"
                  placeholder='Try "3 bedroom apartment in Kilimani under 120k"'
                  className="h-12 w-full rounded-lg border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-3">
                <select name="propertyType" className="hukan-input h-12" defaultValue="">
                  <option value="">Any type</option>
                  <option value="apartment">Apartment</option>
                  <option value="bedsitter">Bedsitter</option>
                  <option value="maisonette">Maisonette</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="villa">Villa</option>
                  <option value="residential_land">Land / Plot</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <select name="beds" className="hukan-input h-12" defaultValue="">
                  <option value="">Beds</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="h-12 w-full">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Featured Properties</h2>
                <p className="mt-1 text-muted-foreground">Hand-picked listings</p>
              </div>
              <Link href="/search?sort=recommended" className="text-sm font-medium text-primary hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p, i) => (
                <PropertyCard key={p.id} property={p} priority={i < 2} />
              ))}
            </div>
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="border-t border-border bg-muted/20 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Recently Added</h2>
                <p className="mt-1 text-muted-foreground">Fresh listings</p>
              </div>
              <Link href="/search?sort=newest" className="text-sm font-medium text-primary hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RecommendationSection />
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">Popular Areas</h2>
          <p className="mt-1 text-muted-foreground">Explore properties across Kenya</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {popularAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <p className="font-medium group-hover:text-primary">{area.name}</p>
                <p className="text-sm text-muted-foreground">{area.county}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">Popular searches</h2>
          <p className="mt-1 text-muted-foreground">High-demand property searches across Kenya</p>
          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Apartments for rent in Kilimani', '/nairobi/kilimani/apartments-for-rent'],
              ['Houses for sale in Karen', '/nairobi/karen/houses-for-sale'],
              ['Property for rent in Westlands', '/nairobi/westlands/property-for-rent'],
              ['Land for sale in Kiambu', '/kiambu/land-for-sale'],
              ['Property for sale in Nairobi', '/nairobi/property-for-sale'],
              ['Apartments for rent in Ruaka', '/kiambu/ruaka/apartments-for-rent'],
              ['Property for rent in Mombasa', '/mombasa/property-for-rent'],
              ['Houses for rent in Nakuru', '/nakuru/houses-for-rent'],
              ['Land for sale in Kakamega', '/kakamega/land-for-sale'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-sm font-medium text-primary hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">Browse by Property Type</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {propertyTypes.map((type) => (
              <Link
                key={type.href}
                href={type.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/50 hover:shadow-sm"
              >
                <span className="text-3xl" aria-hidden>
                  {type.icon}
                </span>
                <span className="font-medium">{type.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Are you a property professional?</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
              List properties, manage leads, and grow your business on Kenya's modern marketplace.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/list-property">
                <Button variant="secondary" size="lg">
                  Post a Property
                </Button>
              </Link>
              <Link href="/agents/join">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Join as Agent
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
