import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  BadgeCheck,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { getPropertyBySlug } from '@/services/propertyService';
import { formatPrice, generateWhatsAppLink } from '@/lib/utils';
import { PropertyContactPanel } from '@/components/property/PropertyContactPanel';
import { TrackView } from '@/components/property/TrackView';
import { Button } from '@/components/ui/button';
import { buildPropertyMetadata } from '@/lib/seo/metadata';
import { propertyListingSchema } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { slugifyPlace } from '@/lib/seo/config';

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: 'Property not found', robots: { index: false } };
  return buildPropertyMetadata(property);
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();

  const primaryImage = property.images.find((i) => i.isPrimary) || property.images[0];
  const locationLabel = [property.location.area, property.location.county]
    .filter(Boolean)
    .join(', ');
  const priceLabel = formatPrice(property.price, property.currency, property.priceFrequency);

  const amenityLabels: Record<string, string> = {
    parking: 'Parking',
    balcony: 'Balcony',
    garden: 'Garden',
    swimmingPool: 'Swimming Pool',
    gym: 'Gym',
    lift: 'Lift',
    dsq: 'DSQ / Servant Quarters',
    servantQuarters: 'Servant Quarters',
    cctv: 'CCTV',
    electricFence: 'Electric Fence',
    gatedCommunity: 'Gated Community',
    borehole: 'Borehole',
    backupWater: 'Backup Water',
    generator: 'Generator',
    solar: 'Solar',
    fibre: 'Fibre Internet',
    airConditioning: 'Air Conditioning',
    petFriendly: 'Pet Friendly',
    furnished: 'Furnished',
    serviced: 'Serviced',
    roadAccess: 'Road Access',
    electricity: 'Electricity',
    water: 'Water',
    freehold: 'Freehold',
    titleAvailable: 'Title Available',
  };

  const activeAmenities = Object.entries(property.amenities || {})
    .filter(([, v]) => v)
    .map(([k]) => amenityLabels[k] || k);

  const demoAgentPhone = '+254712345678';
  const whatsappUrl = generateWhatsAppLink(demoAgentPhone, {
    title: property.title,
    location: locationLabel,
    price: priceLabel,
    id: property.id,
  });

  const countySlug = slugifyPlace(property.location.county);
  const areaSlug = property.location.area ? slugifyPlace(property.location.area) : null;
  const crumbs = [
    { name: 'Home', path: '/' },
    {
      name: property.location.county,
      path: `/${countySlug}/property-for-${property.purpose === 'rent' ? 'rent' : 'sale'}`,
    },
    ...(property.location.area && areaSlug
      ? [{
          name: property.location.area,
          path: `/${countySlug}/${areaSlug}/property-for-${property.purpose === 'rent' ? 'rent' : 'sale'}`,
        }]
      : []),
    { name: property.title, path: `/property/${property.slug}` },
  ];

  return (
    <div className="pb-24 lg:pb-12">
      <TrackView propertyId={property.id} />
      <JsonLd data={propertyListingSchema(property)} />
      <div className="relative bg-muted">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-1 sm:grid-cols-4 sm:grid-rows-2">
            <div className="relative aspect-[16/10] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:h-[420px]">
              {primaryImage && (
                <Image
                  src={primaryImage.secureUrl}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              )}
            </div>
            {property.images.slice(1, 5).map((img, i) => (
              <div key={img.publicId} className="relative hidden aspect-[4/3] sm:block">
                <Image
                  src={img.secureUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
                {i === 3 && property.images.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
                    +{property.images.length - 5} more
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={crumbs} />
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {property.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified Property
                  </span>
                )}
                {property.featured && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {property.title}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {locationLabel}
              </p>
              <p className="mt-3 text-3xl font-bold text-foreground">{priceLabel}</p>
            </div>

            <div className="flex flex-wrap gap-6 border-y border-border py-4">
              {property.bedrooms !== undefined && property.bedrooms > 0 && (
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{property.bedrooms}</p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{property.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                </div>
              )}
              {property.size && (
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">
                      {property.size} {property.sizeUnit || 'sqm'}
                    </p>
                    <p className="text-xs text-muted-foreground">Size</p>
                  </div>
                </div>
              )}
              {property.plotSize && (
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{property.plotSize}</p>
                    <p className="text-xs text-muted-foreground">Plot</p>
                  </div>
                </div>
              )}
              {property.parkingSpaces && (
                <div>
                  <p className="font-semibold">{property.parkingSpaces}</p>
                  <p className="text-xs text-muted-foreground">Parking</p>
                </div>
              )}
            </div>

            <section>
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">
                {property.description}
              </p>
            </section>

            {activeAmenities.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold">Features & Amenities</h2>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {activeAmenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold">Location</h2>
              <div className="mt-3 flex h-64 items-center justify-center rounded-lg border border-border bg-muted">
                <p className="text-sm text-muted-foreground">
                  Map · {locationLabel}
                  {property.location.coordinates &&
                    ` · ${property.location.coordinates.latitude.toFixed(4)}, ${property.location.coordinates.longitude.toFixed(4)}`}
                </p>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <PropertyContactPanel
              propertyId={property.id}
              propertyTitle={property.title}
              locationLabel={locationLabel}
              priceLabel={priceLabel}
              agentPhone={demoAgentPhone}
            />
          </aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background p-3 lg:hidden">
        <div className="flex gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#25D366] py-2.5 text-sm font-medium text-white"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a href={`tel:${demoAgentPhone}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Phone className="mr-1 h-4 w-4" />
              Call
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
