/**
 * Listing management for professionals.
 * Demo: localStorage drafts + published overlay on demo properties.
 * Production: Firestore with agent/agency ownership + Security Rules.
 */

import type { Property, PropertyStatus } from '@/types';
import { getDemoProperties } from '@/lib/demo-data';
import { canPublishListing, getSubscription } from '@/services/subscriptionService';

const DRAFTS_KEY = 'hukan_listing_drafts';
const PUBLISHED_KEY = 'hukan_agent_published';

function loadDrafts(): Property[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((p: Property) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
    }));
  } catch {
    return [];
  }
}

function saveDrafts(list: Property[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(list));
}

function loadPublishedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PUBLISHED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePublishedIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PUBLISHED_KEY, JSON.stringify(ids));
}

export async function getAgentListings(agentId: string): Promise<Property[]> {
  const drafts = loadDrafts().filter((p) => p.agentId === agentId);
  const demo = getDemoProperties().filter((p) => p.agentId === agentId);
  const publishedIds = new Set(loadPublishedIds());
  // Merge: drafts + demo that belong to agent or were published via wizard
  const byId = new Map<string, Property>();
  for (const p of demo) byId.set(p.id, p);
  for (const p of drafts) byId.set(p.id, p);
  return Array.from(byId.values()).sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
  );
}

export async function getActiveListingCount(agentId: string): Promise<number> {
  const list = await getAgentListings(agentId);
  return list.filter((p) => p.status === 'published').length;
}

export async function saveDraft(property: Partial<Property> & { agentId: string }): Promise<Property> {
  const drafts = loadDrafts();
  const now = new Date();
  let existingIdx = -1;
  if (property.id) {
    existingIdx = drafts.findIndex((d) => d.id === property.id);
  }
  const base: Property =
    existingIdx >= 0
      ? drafts[existingIdx]
      : ({
          id: `draft_${Date.now()}`,
          slug: `draft-${Date.now()}`,
          purpose: 'buy',
          category: 'residential',
          propertyType: 'apartment',
          title: '',
          description: '',
          price: 0,
          currency: 'KES',
          location: { country: 'Kenya', county: 'Nairobi' },
          amenities: {},
          status: 'draft',
          verificationStatus: 'unverified',
          images: [],
          featured: false,
          views: 0,
          saves: 0,
          enquiries: 0,
          createdAt: now,
          updatedAt: now,
          agentId: property.agentId,
        } as Property);

  const next: Property = {
    ...base,
    ...property,
    status: (property.status as PropertyStatus) || base.status || 'draft',
    updatedAt: now,
    agentId: property.agentId,
  };

  if (existingIdx >= 0) drafts[existingIdx] = next;
  else drafts.push(next);
  saveDrafts(drafts);
  return next;
}

export async function publishDraft(
  agentId: string,
  propertyId: string
): Promise<{ ok: boolean; property?: Property; error?: string }> {
  const activeCount = await getActiveListingCount(agentId);
  const gate = canPublishListing(agentId, activeCount);
  if (!gate.allowed) {
    return { ok: false, error: gate.reason || 'Listing limit reached. Upgrade to Pro.' };
  }

  const drafts = loadDrafts();
  const idx = drafts.findIndex((d) => d.id === propertyId && d.agentId === agentId);
  if (idx < 0) return { ok: false, error: 'Draft not found' };

  const published: Property = {
    ...drafts[idx],
    status: 'published',
    publishedAt: new Date(),
    updatedAt: new Date(),
    slug:
      drafts[idx].slug?.startsWith('draft-')
        ? `${drafts[idx].title || 'property'}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') +
          `-${Date.now().toString(36)}`
        : drafts[idx].slug,
  };
  drafts[idx] = published;
  saveDrafts(drafts);

  const ids = loadPublishedIds();
  if (!ids.includes(published.id)) {
    ids.push(published.id);
    savePublishedIds(ids);
  }

  return { ok: true, property: published };
}

export async function unpublish(agentId: string, propertyId: string): Promise<void> {
  const drafts = loadDrafts();
  const idx = drafts.findIndex((d) => d.id === propertyId && d.agentId === agentId);
  if (idx >= 0) {
    drafts[idx] = { ...drafts[idx], status: 'archived', updatedAt: new Date() };
    saveDrafts(drafts);
  }
}

export async function deleteDraft(agentId: string, propertyId: string): Promise<void> {
  const drafts = loadDrafts().filter((d) => !(d.id === propertyId && d.agentId === agentId));
  saveDrafts(drafts);
}

export function getQuotaSummary(agentId: string, activeCount: number) {
  const sub = getSubscription(agentId);
  const limit = sub.listingLimit;
  return {
    planId: sub.planId,
    limit,
    used: activeCount,
    remaining: limit === null ? null : Math.max(0, limit - activeCount),
    canPublish: limit === null || activeCount < limit,
  };
}
