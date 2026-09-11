/**
 * Agent subscription state — demo via localStorage.
 * Production: Stripe/M-Pesa webhook → Firestore subscription document.
 */

import {
  AGENT_SUBSCRIPTION_PLANS,
  FREE_LISTING_LIMIT,
  type SubscriptionPlanId,
  getPlan,
} from '@/config/monetization';

const STORAGE_KEY = 'hukan_agent_subscriptions';

export interface AgentSubscription {
  agentId: string;
  planId: SubscriptionPlanId;
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: string | null; // ISO
  listingLimit: number | null;
  featuredCreditsRemaining: number;
  updatedAt: string;
}

function loadAll(): Record<string, AgentSubscription> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, AgentSubscription>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getSubscription(agentId: string): AgentSubscription {
  const all = loadAll();
  if (all[agentId]) return all[agentId];
  // Default free
  return {
    agentId,
    planId: 'free',
    status: 'active',
    currentPeriodEnd: null,
    listingLimit: FREE_LISTING_LIMIT,
    featuredCreditsRemaining: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function getListingQuota(agentId: string): {
  limit: number | null;
  used: number;
  remaining: number | null;
  planId: SubscriptionPlanId;
  canPublish: boolean;
} {
  const sub = getSubscription(agentId);
  // used is supplied by caller or listingService — here we only return plan limit
  return {
    limit: sub.listingLimit,
    used: 0, // listingService fills real count
    remaining: sub.listingLimit,
    planId: sub.planId,
    canPublish: true,
  };
}

/** Activate or change plan (demo — no payment) */
export function activateSubscription(
  agentId: string,
  planId: SubscriptionPlanId
): AgentSubscription {
  const plan = getPlan(planId);
  const periodEnd =
    plan.interval === 'none'
      ? null
      : new Date(
          Date.now() +
            (plan.interval === 'month' ? 30 : 365) * 24 * 60 * 60 * 1000
        ).toISOString();

  const sub: AgentSubscription = {
    agentId,
    planId,
    status: 'active',
    currentPeriodEnd: periodEnd,
    listingLimit: plan.listingLimit,
    featuredCreditsRemaining: plan.featuredCredits,
    updatedAt: new Date().toISOString(),
  };

  const all = loadAll();
  all[agentId] = sub;
  saveAll(all);
  return sub;
}

export function canPublishListing(agentId: string, currentActiveCount: number): {
  allowed: boolean;
  reason?: string;
  limit: number | null;
  planId: SubscriptionPlanId;
} {
  const sub = getSubscription(agentId);
  if (sub.listingLimit === null) {
    return { allowed: true, limit: null, planId: sub.planId };
  }
  if (currentActiveCount >= sub.listingLimit) {
    return {
      allowed: false,
      reason: `Free plan allows ${sub.listingLimit} active listings. Upgrade to Pro for unlimited.`,
      limit: sub.listingLimit,
      planId: sub.planId,
    };
  }
  return { allowed: true, limit: sub.listingLimit, planId: sub.planId };
}

export function listPlans() {
  return AGENT_SUBSCRIPTION_PLANS;
}
