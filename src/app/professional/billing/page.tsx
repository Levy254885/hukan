'use client';

import { useEffect, useState } from 'react';
import {
  AGENT_SUBSCRIPTION_PLANS,
  FEATURED_LISTING_PLANS,
  formatPlanPrice,
  formatKes,
  type SubscriptionPlanId,
} from '@/config/monetization';
import {
  getListingQuota,
  activateSubscription,
  downgradeToFree,
  type ListingQuota,
} from '@/services/subscriptionService';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProfessionalBillingPage() {
  const { user } = useAuth();
  const [quota, setQuota] = useState<ListingQuota | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    if (!user) return;
    setQuota(await getListingQuota(user.id));
  }

  useEffect(() => {
    refresh();
  }, [user]);

  async function subscribe(planId: 'monthly' | 'annual') {
    if (!user) return;
    setBusy(planId);
    setMessage(null);
    try {
      await activateSubscription(user.id, planId);
      await refresh();
      setMessage(
        planId === 'monthly'
          ? 'Pro Monthly activated (demo). You can post unlimited listings.'
          : 'Pro Annual activated (demo). You can post unlimited listings.'
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Subscription failed');
    } finally {
      setBusy(null);
    }
  }

  async function goFree() {
    if (!user) return;
    if (!confirm('Downgrade to Free? You will be limited to 3 active listings.')) return;
    setBusy('free');
    await downgradeToFree(user.id);
    await refresh();
    setBusy(null);
    setMessage('You are on the Free plan (max 3 listings).');
  }

  const currentId: SubscriptionPlanId = quota?.plan.id || 'free';

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold">Plans & billing</h2>
        <p className="text-sm text-muted-foreground">
          Free agents can publish up to <strong>3 listings</strong>. Upgrade to Pro for
          unlimited listings — <strong>KES 500/month</strong> or{' '}
          <strong>KES 50,000/year</strong>.
        </p>
      </div>

      {quota && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <p>
            <span className="font-medium">Current plan:</span> {quota.plan.name} (
            {formatPlanPrice(quota.plan)})
          </p>
          <p className="mt-1 text-muted-foreground">
            Active listings: {quota.activeListings}
            {quota.limit != null ? ` / ${quota.limit}` : ' (unlimited)'}
            {!quota.canPublish && (
              <span className="ml-2 font-medium text-danger">
                Limit reached — subscribe to post more
              </span>
            )}
          </p>
          {quota.subscription.expiresAt && quota.isPaid && (
            <p className="mt-1 text-xs text-muted-foreground">
              Renews / expires:{' '}
              {new Date(quota.subscription.expiresAt).toLocaleDateString('en-KE')}
              {quota.subscription.demoActivated ? ' · Demo activation' : ''}
            </p>
          )}
        </div>
      )}

      {message && (
        <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          {message}
        </p>
      )}

      <section>
        <h3 className="mb-3 font-semibold">Agent plans</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {AGENT_SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = currentId === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  'flex flex-col rounded-xl border p-5',
                  plan.highlighted ? 'border-primary shadow-sm' : 'border-border',
                  isCurrent && 'ring-2 ring-primary/30'
                )}
              >
                <p className="font-semibold">{plan.name}</p>
                <p className="mt-1 text-2xl font-bold">{formatPlanPrice(plan)}</p>
                {plan.id === 'annual' && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatKes(Math.round(plan.priceKes / 12))}/mo billed yearly
                  </p>
                )}
                <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
                {plan.id === 'free' ? (
                  isCurrent ? (
                    <Button className="mt-4" variant="outline" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button
                      className="mt-4"
                      variant="outline"
                      disabled={busy === 'free'}
                      onClick={goFree}
                    >
                      Switch to Free
                    </Button>
                  )
                ) : (
                  <Button
                    className="mt-4"
                    variant={plan.highlighted ? 'primary' : 'outline'}
                    disabled={isCurrent || busy === plan.id}
                    onClick={() => subscribe(plan.id as 'monthly' | 'annual')}
                  >
                    {isCurrent ? 'Current plan' : busy === plan.id ? 'Activating…' : plan.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Demo mode activates plans instantly. Production will use M-Pesa STK Push or card
          and only unlock Pro after confirmed payment.
        </p>
      </section>

      <section>
        <h3 className="mb-3 font-semibold">Featured listing boosts</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Optional paid boosts — separate from your subscription.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURED_LISTING_PLANS.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-border p-5">
              <p className="font-semibold">{plan.name}</p>
              <p className="mt-1 text-xl font-bold">{formatKes(plan.priceKes)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <Button className="mt-4 w-full" variant="outline" disabled>
                Coming soon
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
