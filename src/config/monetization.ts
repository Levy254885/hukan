/**
 * Hukan agent monetization — prices live here, not in UI components.
 * Free: 3 listings. Paid (monthly/annual): unlimited.
 */

export interface FeaturedPlan {
  id: string;
  name: string;
  durationDays: number;
  priceKes: number;
  description: string;
}

export type SubscriptionPlanId = 'free' | 'monthly' | 'annual';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  /** Billed amount in KES for this plan period */
  priceKes: number;
  /** Billing period */
  interval: 'none' | 'month' | 'year';
  /** Max active listings; null = unlimited */
  listingLimit: number | null;
  featuredCredits: number;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

/** Free tier hard limit */
export const FREE_LISTING_LIMIT = 3;

export const AGENT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceKes: 0,
    interval: 'none',
    listingLimit: FREE_LISTING_LIMIT,
    featuredCredits: 0,
    features: [
      `Up to ${FREE_LISTING_LIMIT} active listings`,
      'Basic enquiry inbox',
      'Hukan branding on listings',
    ],
    cta: 'Current plan',
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    priceKes: 500,
    interval: 'month',
    listingLimit: null,
    featuredCredits: 1,
    features: [
      'Unlimited listings',
      '1 featured credit / month',
      'Lead pipeline & analytics',
      'Priority support',
    ],
    cta: 'Subscribe — KES 500/mo',
    highlighted: true,
  },
  {
    id: 'annual',
    name: 'Pro Annual',
    priceKes: 50_000,
    interval: 'year',
    listingLimit: null,
    featuredCredits: 12,
    features: [
      'Unlimited listings',
      '12 featured credits / year',
      'Best value vs monthly',
      'Lead pipeline & analytics',
      'Priority support',
    ],
    cta: 'Subscribe — KES 50,000/yr',
  },
];

export const FEATURED_LISTING_PLANS: FeaturedPlan[] = [
  {
    id: 'feat_7',
    name: '7 days',
    durationDays: 7,
    priceKes: 1500,
    description: 'Boost visibility for one week',
  },
  {
    id: 'feat_14',
    name: '14 days',
    durationDays: 14,
    priceKes: 2500,
    description: 'Two-week featured placement',
  },
  {
    id: 'feat_30',
    name: '30 days',
    durationDays: 30,
    priceKes: 4000,
    description: 'Full month at the top of relevant searches',
  },
];

export function getPlan(id: SubscriptionPlanId): SubscriptionPlan {
  return (
    AGENT_SUBSCRIPTION_PLANS.find((p) => p.id === id) || AGENT_SUBSCRIPTION_PLANS[0]
  );
}

export function formatPlanPrice(plan: SubscriptionPlan): string {
  if (plan.priceKes === 0) return 'Free';
  const amount = `KES ${plan.priceKes.toLocaleString('en-KE')}`;
  if (plan.interval === 'month') return `${amount}/month`;
  if (plan.interval === 'year') return `${amount}/year`;
  return amount;
}

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}
