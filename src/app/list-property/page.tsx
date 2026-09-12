'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  createDraft,
  getDraft,
  updateDraft,
  publishDraft,
  type ListingDraft,
} from '@/services/listingService';
import { Button } from '@/components/ui/button';
import { getListingQuota, type ListingQuota } from '@/services/subscriptionService';
import { cn } from '@/lib/utils';
import type { PropertyPurpose, PropertyType, AmenityFlags } from '@/types';

const STEPS = [
  'Purpose',
  'Type',
  'Location',
  'Details',
  'Amenities',
  'Price',
  'Photos',
  'Description',
  'Contact',
  'Preview',
  'Submit',
] as const;

const PURPOSES: { value: PropertyPurpose; label: string; desc: string }[] = [
  { value: 'rent', label: 'Rent', desc: 'Property available to rent' },
  { value: 'buy', label: 'Sale', desc: 'Property for sale' },
  { value: 'land', label: 'Land', desc: 'Plot or land parcel' },
  { value: 'commercial', label: 'Commercial', desc: 'Office, shop, warehouse' },
];

const TYPES_BY_PURPOSE: Record<string, { value: PropertyType; label: string }[]> = {
  rent: [
    { value: 'apartment', label: 'Apartment' },
    { value: 'bedsitter', label: 'Bedsitter' },
    { value: 'studio', label: 'Studio' },
    { value: 'maisonette', label: 'Maisonette' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'villa', label: 'Villa' },
  ],
  buy: [
    { value: 'apartment', label: 'Apartment' },
    { value: 'maisonette', label: 'Maisonette' },
    { value: 'bungalow', label: 'Bungalow' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'villa', label: 'Villa' },
    { value: 'mansion', label: 'Mansion' },
  ],
  land: [
    { value: 'residential_land', label: 'Residential land' },
    { value: 'commercial_land', label: 'Commercial land' },
    { value: 'agricultural_land', label: 'Agricultural land' },
  ],
  commercial: [
    { value: 'office', label: 'Office' },
    { value: 'shop', label: 'Shop' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'retail', label: 'Retail' },
  ],
};

const AMENITY_LIST: { key: keyof AmenityFlags; label: string }[] = [
  { key: 'parking', label: 'Parking' },
  { key: 'balcony', label: 'Balcony' },
  { key: 'garden', label: 'Garden' },
  { key: 'swimmingPool', label: 'Swimming pool' },
  { key: 'gym', label: 'Gym' },
  { key: 'lift', label: 'Lift' },
  { key: 'dsq', label: 'DSQ' },
  { key: 'cctv', label: 'CCTV' },
  { key: 'electricFence', label: 'Electric fence' },
  { key: 'gatedCommunity', label: 'Gated community' },
  { key: 'borehole', label: 'Borehole' },
  { key: 'backupWater', label: 'Backup water' },
  { key: 'generator', label: 'Generator' },
  { key: 'solar', label: 'Solar' },
  { key: 'fibre', label: 'Fibre' },
  { key: 'furnished', label: 'Furnished' },
  { key: 'serviced', label: 'Serviced' },
  { key: 'petFriendly', label: 'Pet friendly' },
];

const COUNTIES = [
  'Nairobi', 'Kiambu', 'Mombasa', 'Nakuru', 'Kisumu', 'Uasin Gishu',
  'Kakamega', 'Machakos', 'Kajiado', 'Kilifi', 'Nyeri', 'Meru',
];

function ListPropertyWizard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftParam = searchParams.get('draft');

  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [quota, setQuota] = useState<ListingQuota | null>(null);

  const agentId = user?.id || 'anonymous';

  useEffect(() => {
    if (!user) return;
    getListingQuota(agentId).then(setQuota);
  }, [user, agentId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/signin');
      return;
    }

    async function init() {
      if (draftParam) {
        const existing = await getDraft(agentId, draftParam);
        if (existing) {
          setDraft(existing);
          setStep(existing.step || 1);
          return;
        }
      }
      const created = await createDraft(agentId);
      setDraft(created);
      window.history.replaceState(null, '', `/list-property?draft=${created.id}`);
    }
    init();
  }, [user, authLoading, draftParam, agentId, router]);

  const persist = useCallback(
    async (updates: Partial<ListingDraft>, nextStep?: number) => {
      if (!draft || !user) return;
      setSaving(true);
      setError('');
      try {
        const updated = await updateDraft(agentId, draft.id, {
          ...updates,
          step: nextStep ?? step,
        });
        setDraft(updated);
        if (nextStep) setStep(nextStep);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save');
      } finally {
        setSaving(false);
      }
    },
    [draft, user, agentId, step]
  );

  function next() {
    if (step < 11) persist({}, step + 1);
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  async function handlePublish() {
    if (!draft || !user) return;
    setSaving(true);
    setError('');
    try {
      const property = await publishDraft(agentId, draft.id);
      setPublishedId(property.id);
      setStep(11);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !draft) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (publishedId && step === 11) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-2xl">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold">Listing submitted</h1>
        <p className="mt-2 text-muted-foreground">
          Your property is pending review. It will go live once approved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/professional/listings">
            <Button>Go to listings</Button>
          </Link>
          <Link href="/list-property">
            <Button variant="outline">Add another</Button>
          </Link>
        </div>
      </div>
    );
  }

  const types = TYPES_BY_PURPOSE[draft.purpose || 'rent'] || TYPES_BY_PURPOSE.rent;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {step} of {STEPS.length}: {STEPS[step - 1]}
          </span>
          {saving && <span className="text-muted-foreground">Saving…</span>}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {quota && !quota.canPublish && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/5 px-4 py-3 text-sm">
          <p className="font-medium text-danger">Listing limit reached</p>
          <p className="mt-1 text-muted-foreground">
            Free plan allows {quota.limit} active listings. You have {quota.activeListings}.
            Subscribe to Pro (KES 500/month or KES 50,000/year) to post unlimited listings.
          </p>
          <Link href="/professional/billing" className="mt-2 inline-block font-medium text-primary hover:underline">
            View plans & subscribe →
          </Link>
        </div>
      )}
      {error && (
        <p className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="min-h-[320px]">
        {step === 1 && (
          <StepShell title="What are you listing?">
            <div className="grid gap-3 sm:grid-cols-2">
              {PURPOSES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() =>
                    persist(
                      {
                        purpose: p.value,
                        category:
                          p.value === 'land'
                            ? 'land'
                            : p.value === 'commercial'
                              ? 'commercial'
                              : 'residential',
                      },
                      2
                    )
                  }
                  className={cn(
                    'rounded-lg border p-4 text-left transition-colors hover:border-primary',
                    draft.purpose === p.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  )}
                >
                  <p className="font-semibold">{p.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Property type">
            <div className="grid gap-2 sm:grid-cols-2">
              {types.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => persist({ propertyType: t.value }, 3)}
                  className={cn(
                    'rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors hover:border-primary',
                    draft.propertyType === t.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <NavButtons onBack={back} />
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="Location">
            <Field label="County">
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={draft.location?.county || ''}
                onChange={(e) =>
                  persist({
                    location: { ...draft.location, country: 'Kenya', county: e.target.value },
                  })
                }
              >
                <option value="">Select county</option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Area / Estate">
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Kilimani"
                value={draft.location?.area || ''}
                onChange={(e) =>
                  persist({
                    location: {
                      country: 'Kenya',
                      county: draft.location?.county || '',
                      area: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <NavButtons
              onBack={back}
              onNext={() => {
                if (!draft.location?.county || !draft.location?.area) {
                  setError('County and area are required');
                  return;
                }
                next();
              }}
            />
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="Details">
            <Field label="Title">
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Spacious 3 Bedroom Apartment"
                value={draft.title || ''}
                onChange={(e) => persist({ title: e.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              {draft.purpose !== 'land' && (
                <>
                  <Field label="Bedrooms">
                    <input
                      type="number"
                      min={0}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={draft.bedrooms ?? ''}
                      onChange={(e) =>
                        persist({ bedrooms: e.target.value ? Number(e.target.value) : undefined })
                      }
                    />
                  </Field>
                  <Field label="Bathrooms">
                    <input
                      type="number"
                      min={0}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={draft.bathrooms ?? ''}
                      onChange={(e) =>
                        persist({ bathrooms: e.target.value ? Number(e.target.value) : undefined })
                      }
                    />
                  </Field>
                </>
              )}
              <Field label={draft.purpose === 'land' ? 'Plot size (e.g. 50x100)' : 'Size (sqm)'}>
                {draft.purpose === 'land' ? (
                  <input
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="50x100"
                    value={draft.plotSize || ''}
                    onChange={(e) => persist({ plotSize: e.target.value })}
                  />
                ) : (
                  <input
                    type="number"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={draft.size ?? ''}
                    onChange={(e) =>
                      persist({ size: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                )}
              </Field>
              <Field label="Parking spaces">
                <input
                  type="number"
                  min={0}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={draft.parkingSpaces ?? ''}
                  onChange={(e) =>
                    persist({
                      parkingSpaces: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </Field>
            </div>
            <NavButtons onBack={back} onNext={next} />
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title="Amenities">
            <div className="flex flex-wrap gap-2">
              {AMENITY_LIST.map((a) => {
                const active = !!(draft.amenities as Record<string, boolean>)?.[a.key];
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() =>
                      persist({
                        amenities: {
                          ...draft.amenities,
                          [a.key]: !active,
                        },
                      })
                    }
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
            <NavButtons onBack={back} onNext={next} />
          </StepShell>
        )}

        {step === 6 && (
          <StepShell title="Price">
            <Field label="Price (KES)">
              <input
                type="number"
                min={0}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={draft.purpose === 'rent' ? 'e.g. 95000' : 'e.g. 15000000'}
                value={draft.price ?? ''}
                onChange={(e) =>
                  persist({ price: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </Field>
            {draft.purpose === 'rent' && (
              <p className="mt-2 text-sm text-muted-foreground">Per month</p>
            )}
            <NavButtons
              onBack={back}
              onNext={() => {
                if (!draft.price || draft.price <= 0) {
                  setError('Enter a valid price');
                  return;
                }
                next();
              }}
            />
          </StepShell>
        )}

        {step === 7 && (
          <StepShell title="Photos">
            <p className="mb-4 text-sm text-muted-foreground">
              Add image URLs for now. Cloudinary upload will replace this in production.
            </p>
            <Field label="Primary image URL">
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://..."
                value={(draft as { images?: { url?: string }[] }).images?.[0]?.url || ''}
                onChange={(e) =>
                  persist({
                    images: e.target.value
                      ? [
                          {
                            publicId: 'draft',
                            secureUrl: e.target.value,
                            url: e.target.value,
                            width: 800,
                            height: 600,
                            format: 'jpg',
                            order: 0,
                            isPrimary: true,
                          } as never,
                        ]
                      : [],
                  } as Partial<ListingDraft>)
                }
              />
            </Field>
            <NavButtons onBack={back} onNext={next} />
          </StepShell>
        )}

        {step === 8 && (
          <StepShell title="Description">
            <Field label="Describe the property">
              <textarea
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Highlight key features, nearby amenities, and what makes this property special…"
                value={draft.description || ''}
                onChange={(e) => persist({ description: e.target.value })}
              />
            </Field>
            <NavButtons onBack={back} onNext={next} />
          </StepShell>
        )}

        {step === 9 && (
          <StepShell title="Contact details">
            <Field label="Contact phone">
              <input
                type="tel"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="07XX XXX XXX"
                value={(draft as { contactPhone?: string }).contactPhone || ''}
                onChange={(e) =>
                  persist({ contactPhone: e.target.value } as Partial<ListingDraft>)
                }
              />
            </Field>
            <NavButtons onBack={back} onNext={next} />
          </StepShell>
        )}

        {step === 10 && (
          <StepShell title="Preview & submit">
            <div className="space-y-2 rounded-lg border border-border p-4">
              <p className="text-xl font-bold">{draft.title || 'Untitled'}</p>
              <p className="text-lg font-semibold text-primary">
                {draft.price
                  ? `KES ${draft.price.toLocaleString()}${draft.purpose === 'rent' ? '/mo' : ''}`
                  : 'Price TBC'}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {draft.propertyType?.replace('_', ' ')} · {draft.location?.area},{' '}
                {draft.location?.county}
              </p>
              {draft.bedrooms !== undefined && (
                <p className="text-sm">
                  {draft.bedrooms} bed · {draft.bathrooms ?? '—'} bath
                  {draft.size ? ` · ${draft.size} sqm` : ''}
                </p>
              )}
              {draft.description && (
                <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
                  {draft.description}
                </p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={back}>
                Back
              </Button>
              <Button
                onClick={handlePublish}
                disabled={saving || (quota ? !quota.canPublish : false)}
                className="flex-1"
              >
                {saving ? 'Submitting…' : 'Submit for review'}
              </Button>
            </div>
          </StepShell>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Draft autosaved ·{' '}
        <Link href="/professional/listings" className="underline">
          Back to listings
        </Link>
      </p>
    </div>
  );
}

function StepShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">{title}</h1>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
}: {
  onBack?: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="mt-8 flex gap-3">
      {onBack && (
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
      )}
      {onNext && (
        <Button type="button" onClick={onNext} className="flex-1">
          Continue
        </Button>
      )}
    </div>
  );
}

export default function ListPropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ListPropertyWizard />
    </Suspense>
  );
}
