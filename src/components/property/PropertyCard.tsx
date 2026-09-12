'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Share2, MapPin, Bed, Bath, Maximize, BadgeCheck, GitCompare } from 'lucide-react';
import type { Property } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { useCompare } from '@/hooks/useCompare';

interface PropertyCardProps {
  property: Property;
  className?: string;
  priority?: boolean;
}

export function PropertyCard({ property, className, priority = false }: PropertyCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isSaved, toggle } = useSavedProperties();
  const { isCompared, toggle: toggleCompare } = useCompare();
  const saved = isSaved(property.id);
  const compared = isCompared(property.id);

  const primaryImage =
    property.images.find((img) => img.isPrimary) || property.images[0];
  const imageCount = property.images.length;
  const locationLabel = [property.location.area, property.location.county]
    .filter(Boolean)
    .join(', ');

  const priceLabel = formatPrice(
    property.price,
    property.currency,
    property.priceFrequency
  );

  const keyFacts: string[] = [];
  if (property.bedrooms !== undefined && property.bedrooms > 0) {
    keyFacts.push(`${property.bedrooms} bed`);
  } else if (property.propertyType === 'bedsitter') {
    keyFacts.push('Bedsitter');
  }
  if (property.bathrooms) keyFacts.push(`${property.bathrooms} bath`);
  if (property.size) keyFacts.push(`${property.size} ${property.sizeUnit || 'sqm'}`);
  if (property.plotSize) keyFacts.push(property.plotSize);

  const topAmenities = Object.entries(property.amenities || {})
    .filter(([, v]) => v)
    .slice(0, 3)
    .map(([k]) => {
      const labels: Record<string, string> = {
        parking: 'Parking',
        balcony: 'Balcony',
        garden: 'Garden',
        swimmingPool: 'Pool',
        gym: 'Gym',
        lift: 'Lift',
        dsq: 'DSQ',
        gatedCommunity: 'Gated',
        borehole: 'Borehole',
        fibre: 'Fibre',
        generator: 'Generator',
      };
      return labels[k] || k;
    });

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/signin');
      return;
    }
    await toggle(property.id);
  }

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-lift',
        className
      )}
    >
      <Link
        href={`/property/${property.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
      >
        {primaryImage ? (
          <Image
            src={primaryImage.secureUrl}
            alt={primaryImage.alt || property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 opacity-80" />

        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {property.featured && (
            <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold tracking-wide text-accent-foreground shadow-sm">
              Featured
            </span>
          )}
          {property.verificationStatus === 'verified' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-success/95 px-2 py-0.5 text-[11px] font-medium text-success-foreground shadow-sm">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>

        {imageCount > 1 && (
          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            1 / {imageCount}
          </span>
        )}

        <button
          type="button"
          className={cn(
            'absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full',
            'shadow-md backdrop-blur-sm transition-all duration-200',
            'active:scale-90',
            saved
              ? 'bg-primary text-primary-foreground'
              : 'bg-white/90 text-foreground hover:bg-white hover:scale-105'
          )}
          aria-label={saved ? 'Unsave property' : 'Save property'}
          onClick={handleSave}
        >
          <Heart className={cn('h-4 w-4 transition-transform', saved && 'fill-current scale-110')} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <p className="text-lg font-bold tracking-tight text-foreground">{priceLabel}</p>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium transition-colors',
                compared
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-label="Compare"
              onClick={(e) => {
                e.preventDefault();
                const r = toggleCompare(property.id);
                if (r.message) alert(r.message);
              }}
            >
              <GitCompare className="h-3.5 w-3.5" />
              {compared ? 'Added' : 'Compare'}
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Share"
              onClick={(e) => {
                e.preventDefault();
                if (navigator.share) {
                  navigator.share({
                    title: property.title,
                    url: `${window.location.origin}/property/${property.slug}`,
                  });
                }
              }}
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <Link href={`/property/${property.slug}`} className="group/title">
          <h3 className="line-clamp-1 font-medium text-foreground transition-colors group-hover/title:text-primary">
            {property.title}
          </h3>
        </Link>

        {keyFacts.length > 0 && (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
            {keyFacts.map((fact) => (
              <span key={fact} className="inline-flex items-center gap-1">
                {fact.includes('bed') && <Bed className="h-3.5 w-3.5 opacity-70" />}
                {fact.includes('bath') && <Bath className="h-3.5 w-3.5 opacity-70" />}
                {(fact.includes('sqm') || fact.includes('x')) && (
                  <Maximize className="h-3.5 w-3.5 opacity-70" />
                )}
                {fact}
              </span>
            ))}
          </p>
        )}

        <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <span className="truncate">{locationLabel}</span>
        </p>

        {topAmenities.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground/90">{topAmenities.join(' · ')}</p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3 mt-3">
          <span className="text-xs capitalize text-muted-foreground">
            {property.propertyType.replace(/_/g, ' ')}
          </span>
          <span className="text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </article>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="aspect-[4/3] skeleton" />
      <div className="space-y-2.5 p-4">
        <div className="h-6 w-1/2 skeleton" />
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-4 w-1/3 skeleton" />
        <div className="h-3 w-1/2 skeleton" />
      </div>
    </div>
  );
}
