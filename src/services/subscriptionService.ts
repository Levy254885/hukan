/**
 * Agent subscription state — demo via localStorage.
 * Production: M-Pesa/Stripe webhook → Firestore agent.subscription
 */

import {
  AGENT_SUBSCRIPTION_PLANS,
  FREE_LISTING_LIMIT,
  getPlan,
  type SubscriptionPlan,
  type SubscriptionPlanId,
} from '@/config/monetization';

const SUB_KEY = 'hukan_agent_subscriptions';
const PUBLISHED_KEY = 'hukan_agent_listings';

export interface AgentSubscription {
  agentId: string;
  planId: SubscriptionPlanId;
  status: 'active' | 'cancelled' | 'expired';
  startedAt: string;
  expiresAt: string | null;
  demoActivated?: boolean;
  updatedAt: string;
}

export interface ListingQuota {
  plan: SubscriptionPlan;
  subscription: AgentSubscription;
  activeListings: number;
  limit: number | null;
  remaining: number | null;
  canPublish: boolean;
  isPaid: boolean;
}

function loadAll(): Record<string, AgentSubscription> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(SUB_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAll(map: Record<string, AgentSubscription>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUB_KEY, JSON.stringify(map));
}

function defaultFree(agentId: string): AgentSubscription {
  return {
    agentId,
    planId: 'free',
    status: 'active',
    startedAt: new Date().toISOString(),
    expiresAt: null,
    updatedAt: new Date().toISOString(),
  };
}

function isExpired(sub: AgentSubscription): boolean {
  if (!sub.expiresAt) return false;
  return new Date(sub.expiresAt).getTime() < Date.now();
}

function countActiveListings(agentId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = JSON.parse(localStorage.getItem(PUBLISHED_KEY) || '[]');
    return raw.filter(
      (p: { agentId?: string; status?: string }) =>
        p.agentId === agentId &&
        (p.status === 'published' || p.status === 'pending_review')
    ).length;
  } catch {
    return 0;
  }
}

export async function getAgentSubscription(agentId: string): Promise<AgentSubscription> {
  const all = loadAll();
  let sub = all[agentId] || defaultFree(agentId);

  if (sub.planId !== 'free' && isExpired(sub)) {
    sub = {
      ...defaultFree(agentId),
      updatedAt: new Date().toISOString(),
    };
    all[agentId] = sub;
    saveAll(all);
  }

  if (!all[agentId]) {
    all[agentId] = sub;
    saveAll(all);
  }

  return sub;
}

export async function getListingQuota(agentId: string): Promise<ListingQuota> {
  const subscription = await getAgentSubscription(agentId);
  const plan = getPlan(subscription.planId);
  const activeListings = countActiveListings(agentId);
  const limit = plan.listingLimit;
  const remaining = limit == null ? null : Math.max(0, limit - activeListings);
  const canPublish = limit == null ? true : activeListings < limit;
  const isPaid = subscription.planId !== 'free' && subscription.status === 'active';

  return {
    plan,
    subscription,
    activeListings,
    limit,
    remaining,
    canPublish,
    isPaid,
  };
}

export async function activateSubscription(
  agentId: string,
  planId: 'monthly' | 'annual'
): Promise<AgentSubscription> {
  const plan = getPlan(planId);
  const now = new Date();
  const expires = new Date(now);

  if (plan.interval === 'month') {
    expires.setMonth(expires.getMonth() + 1);
  } else if (plan.interval === 'year') {
    expires.setFullYear(expires.getFullYear() + 1);
  }

  const sub: AgentSubscription = {
    agentId,
    planId,
    status: 'active',
    startedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    demoActivated: true,
    updatedAt: now.toISOString(),
  };

  const all = loadAll();
  all[agentId] = sub;
  saveAll(all);
  return sub;
}

export async function cancelSubscription(agentId: string): Promise<AgentSubscription> {
  const all = loadAll();
  const sub = all[agentId] || defaultFree(agentId);
  const next: AgentSubscription = {
    ...sub,
    status: sub.expiresAt ? 'cancelled' : 'active',
    planId: sub.expiresAt ? sub.planId : 'free',
    updatedAt: new Date().toISOString(),
  };
  if (!sub.expiresAt) {
    next.planId = 'free';
    next.status = 'active';
    next.expiresAt = null;
  }
  all[agentId] = next;
  saveAll(all);
  return next;
}

export async function downgradeToFree(agentId: string): Promise<AgentSubscription> {
  const sub = defaultFree(agentId);
  const all = loadAll();
  all[agentId] = sub;
  saveAll(all);
  return sub;
}

export function listPublicPlans(): SubscriptionPlan[] {
  return AGENT_SUBSCRIPTION_PLANS;
}

export function canPublishListing(
  agentId: string,
  currentActiveCount: number
): { allowed: boolean; reason?: string; limit: number | null; planId: SubscriptionPlanId } {
  // Sync helper for callers that already have a count
  void agentId;
  const plan = getPlan('free');
  // Prefer checking via getListingQuota in UI; this is a lightweight fallback
  if (plan.listingLimit != null && currentActiveCount >= plan.listingLimit) {
    return {
      allowed: false,
      reason: `Free plan allows ${plan.listingLimit} active listings. Upgrade to Pro for unlimited.`,
      limit: plan.listingLimit,
      planId: 'free',
    };
  }
  return { allowed: true, limit: plan.listingLimit, planId: 'free' };
}

export { FREE_LISTING_LIMIT };
