/**
 * Listing management for professionals.
 * Demo: localStorage drafts + published overlay on demo properties.
 */

import type {
  Property,
  PropertyPurpose,
  PropertyCategory,
  PropertyType,
  PropertyStatus,
  AmenityFlags,
  Location,
} from '@/types';
import { DEMO_PROPERTIES } from '@/lib/demo-data';
import { getListingQuota } from './subscriptionService';

const DRAFTS_KEY = 'hukan_listing_drafts';
const PUBLISHED_KEY = 'hukan_agent_listings';

export interface ListingDraft {
  id: string;
  agentId: string;
  step: number;
  purpose?: PropertyPurpose;
  category?: PropertyCategory;
  propertyType?: PropertyType;
  title?: string;
  description?: string;
  price?: number;
  priceFrequency?: 'total' | 'month' | 'year';
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit?: 'sqm' | 'sqft' | 'acre';
  parkingSpaces?: number;
  plotSize?: string;
  location?: Partial<Location>;
  amenities?: Partial<AmenityFlags>;
  images?: { url: string; isPrimary: boolean }[];
  status: 'draft' | 'pending_review' | 'published';
  createdAt: string;
  updatedAt: string;
}

function loadDrafts(): ListingDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDrafts(drafts: ListingDraft[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

function loadPublished(): Property[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(PUBLISHED_KEY) || '[]');
    return raw.map((p: Property) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
    }));
  } catch {
    return [];
  }
}

function savePublished(list: Property[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PUBLISHED_KEY, JSON.stringify(list));
}

export async function getAgentListings(agentId: string): Promise<Property[]> {
  const fromDemo = DEMO_PROPERTIES.filter(
    (p) => p.agentId === agentId || p.agentId === 'agent_001'
  );
  const fromLocal = loadPublished().filter((p) => p.agentId === agentId);
  const map = new Map<string, Property>();
  [...fromDemo, ...fromLocal].forEach((p) => map.set(p.id, p));
  return Array.from(map.values()).sort(
    (a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0)
  );
}

export async function getAgentDrafts(agentId: string): Promise<ListingDraft[]> {
  return loadDrafts()
    .filter((d) => d.agentId === agentId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDraft(agentId: string, draftId: string): Promise<ListingDraft | null> {
  return loadDrafts().find((d) => d.agentId === agentId && d.id === draftId) ?? null;
}

export async function createDraft(agentId: string): Promise<ListingDraft> {
  const now = new Date().toISOString();
  const draft: ListingDraft = {
    id: `draft_${Date.now().toString(36)}`,
    agentId,
    step: 1,
    status: 'draft',
    amenities: {},
    location: { country: 'Kenya' },
    images: [],
    createdAt: now,
    updatedAt: now,
  };
  const all = loadDrafts();
  all.push(draft);
  saveDrafts(all);
  return draft;
}

export async function updateDraft(
  agentId: string,
  draftId: string,
  updates: Partial<ListingDraft>
): Promise<ListingDraft> {
  const all = loadDrafts();
  const idx = all.findIndex((d) => d.agentId === agentId && d.id === draftId);
  if (idx === -1) throw new Error('Draft not found');
  all[idx] = {
    ...all[idx],
    ...updates,
    id: all[idx].id,
    agentId: all[idx].agentId,
    updatedAt: new Date().toISOString(),
  };
  saveDrafts(all);
  return all[idx];
}

export async function deleteDraft(agentId: string, draftId: string): Promise<void> {
  saveDrafts(loadDrafts().filter((d) => !(d.agentId === agentId && d.id === draftId)));
}

export async function publishDraft(agentId: string, draftId: string): Promise<Property> {
  const quota = await getListingQuota(agentId);
  if (!quota.canPublish) {
    throw new Error(
      `Listing limit reached (${quota.limit} on Free plan). Subscribe to Pro to post unlimited listings.`
    );
  }

  const draft = await getDraft(agentId, draftId);
  if (!draft) throw new Error('Draft not found');
  if (!draft.title || !draft.price || !draft.purpose || !draft.propertyType) {
    throw new Error('Draft is incomplete');
  }

  const now = new Date();
  const id = `prop_${Date.now().toString(36)}`;
  const slug = `${draft.title}-${draft.location?.area || 'kenya'}-${id.slice(-6)}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  const property: Property = {
    id,
    slug,
    purpose: draft.purpose,
    category: draft.category || 'residential',
    propertyType: draft.propertyType,
    title: draft.title,
    description: draft.description || '',
    price: draft.price,
    currency: 'KES',
    priceFrequency: draft.priceFrequency || (draft.purpose === 'rent' ? 'month' : 'total'),
    bedrooms: draft.bedrooms,
    bathrooms: draft.bathrooms,
    size: draft.size,
    sizeUnit: draft.sizeUnit || 'sqm',
    parkingSpaces: draft.parkingSpaces,
    plotSize: draft.plotSize,
    location: {
      country: 'Kenya',
      county: draft.location?.county || 'Nairobi',
      city: draft.location?.city,
      area: draft.location?.area,
      estate: draft.location?.estate,
      coordinates: draft.location?.coordinates,
    },
    amenities: (draft.amenities || {}) as AmenityFlags,
    status: 'pending_review',
    verificationStatus: 'unverified',
    agentId,
    images: (draft.images || []).map((img, i) => ({
      publicId: `local/${id}_${i}`,
      secureUrl: img.url,
      width: 800,
      height: 600,
      format: 'jpg',
      order: i,
      isPrimary: img.isPrimary || i === 0,
    })),
    featured: false,
    views: 0,
    saves: 0,
    enquiries: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  const published = loadPublished();
  published.push(property);
  savePublished(published);
  await deleteDraft(agentId, draftId);
  return property;
}

export async function updateListingStatus(
  agentId: string,
  propertyId: string,
  status: PropertyStatus
): Promise<void> {
  const list = loadPublished();
  const idx = list.findIndex((p) => p.id === propertyId && p.agentId === agentId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], status, updatedAt: new Date() };
    savePublished(list);
  }
}

export interface AgentMetrics {
  totalListings: number;
  published: number;
  pending: number;
  drafts: number;
  totalViews: number;
  totalSaves: number;
  totalEnquiries: number;
}

export async function getAgentMetrics(agentId: string): Promise<AgentMetrics> {
  const listings = await getAgentListings(agentId);
  const drafts = await getAgentDrafts(agentId);
  return {
    totalListings: listings.length,
    published: listings.filter((p) => p.status === 'published').length,
    pending: listings.filter((p) => p.status === 'pending_review').length,
    drafts: drafts.length,
    totalViews: listings.reduce((s, p) => s + (p.views || 0), 0),
    totalSaves: listings.reduce((s, p) => s + (p.saves || 0), 0),
    totalEnquiries: listings.reduce((s, p) => s + (p.enquiries || 0), 0),
  };
}
