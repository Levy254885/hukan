'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  type VitalMetric,
  type VitalName,
  rateVital,
  getSessionId,
  sendVitals,
  bufferVitalLocally,
} from '@/lib/performance/web-vitals';

/**
 * Reports Core Web Vitals to /api/vitals.
 * Uses dynamic import of `web-vitals` so the app still builds if the package
 * is not yet installed in a given environment.
 */
export function WebVitalsReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queue = useRef<VitalMetric[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function flush() {
      if (!queue.current.length) return;
      const metrics = queue.current.splice(0, queue.current.length);
      const nav = navigator as Navigator & {
        connection?: { effectiveType?: string };
        deviceMemory?: number;
      };

      sendVitals({
        sessionId: getSessionId(),
        metrics,
        userAgent: navigator.userAgent,
        connection: nav.connection?.effectiveType,
        deviceMemory: nav.deviceMemory,
        url: window.location.href,
      });
    }

    function scheduleFlush() {
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flush, 2000);
    }

    function onMetric(
      name: VitalName,
      metric: {
        value: number;
        delta: number;
        id: string;
        rating?: string;
        navigationType?: string;
        attribution?: Record<string, unknown>;
      }
    ) {
      if (cancelled) return;

      const path =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : '');

      const payload: VitalMetric = {
        name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        rating: rateVital(name, metric.value),
        navigationType: metric.navigationType,
        path: path || window.location.pathname,
        attribution: metric.attribution,
        timestamp: Date.now(),
      };

      bufferVitalLocally(payload);

      if (process.env.NODE_ENV === 'development') {
        const color =
          payload.rating === 'good'
            ? '#16a34a'
            : payload.rating === 'needs-improvement'
              ? '#ca8a04'
              : '#dc2626';
        console.log(
          `%c[CWV] ${payload.name} ${payload.value.toFixed(
            payload.name === 'CLS' ? 3 : 0
          )} (${payload.rating})`,
          `color:${color};font-weight:bold`
        );
      }

      queue.current.push(payload);
      scheduleFlush();
    }

    async function init() {
      try {
        const {
          onLCP,
          onINP,
          onCLS,
          onFCP,
          onTTFB,
        } = await import('web-vitals');

        onLCP((m) => onMetric('LCP', m));
        onINP((m) => onMetric('INP', m));
        onCLS((m) => onMetric('CLS', m));
        onFCP((m) => onMetric('FCP', m));
        onTTFB((m) => onMetric('TTFB', m));
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[CWV] web-vitals package not available. Run: npm install web-vitals'
          );
        }
      }
    }

    init();

    const onHide = () => flush();
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });

    return () => {
      cancelled = true;
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flush();
      window.removeEventListener('pagehide', onHide);
    };
  }, [pathname, searchParams]);

  return null;
}
