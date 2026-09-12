'use client';

import { useEffect, useState } from 'react';
import {
  type VitalMetric,
  type VitalName,
  VITAL_THRESHOLDS,
  formatVitalValue,
} from '@/lib/performance/web-vitals';

const ORDER: VitalName[] = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];

/**
 * Floating HUD for Core Web Vitals.
 * Enable with ?cwv=1 in the URL (dev or staging).
 */
export function WebVitalsDebug() {
  const [enabled, setEnabled] = useState(false);
  const [metrics, setMetrics] = useState<Partial<Record<VitalName, VitalMetric>>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const on =
      params.get('cwv') === '1' ||
      process.env.NEXT_PUBLIC_CWV_DEBUG === 'true';
    setEnabled(on);
    if (!on) return;

    const interval = setInterval(() => {
      const buf = (window as Window & { __HUKAN_VITALS__?: VitalMetric[] })
        .__HUKAN_VITALS__;
      if (!buf?.length) return;
      const next: Partial<Record<VitalName, VitalMetric>> = {};
      for (const m of buf) {
        next[m.name] = m; // latest wins
      }
      setMetrics(next);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="fixed bottom-20 right-3 z-[100] w-56 rounded-lg border border-border bg-card/95 p-3 text-xs shadow-lg backdrop-blur md:bottom-4"
      role="status"
      aria-label="Core Web Vitals debug"
    >
      <p className="mb-2 font-semibold text-foreground">Core Web Vitals</p>
      <ul className="space-y-1.5">
        {ORDER.map((name) => {
          const m = metrics[name];
          const threshold = VITAL_THRESHOLDS[name];
          return (
            <li key={name} className="flex items-center justify-between gap-2">
              <span className="font-medium text-muted-foreground">{name}</span>
              {m ? (
                <span
                  className={
                    m.rating === 'good'
                      ? 'text-success'
                      : m.rating === 'needs-improvement'
                        ? 'text-warning'
                        : 'text-danger'
                  }
                >
                  {formatVitalValue(name, m.value)}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  ≤{formatVitalValue(name, threshold.good)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Add <code className="text-foreground">?cwv=1</code> to toggle
      </p>
    </div>
  );
}
