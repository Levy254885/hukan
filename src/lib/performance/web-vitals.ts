/**
 * Core Web Vitals monitoring for Hukan.
 * Metrics: LCP, INP, CLS, FCP, TTFB
 *
 * Thresholds follow Google's "good" targets (web.dev):
 * - LCP ≤ 2.5s
 * - INP ≤ 200ms
 * - CLS ≤ 0.1
 * - FCP ≤ 1.8s
 * - TTFB ≤ 800ms
 */

export type VitalName = 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';

export type VitalRating = 'good' | 'needs-improvement' | 'poor';

export interface VitalMetric {
  name: VitalName;
  value: number;
  rating: VitalRating;
  delta: number;
  id: string;
  navigationType?: string;
  /** page path when metric was captured */
  path: string;
  /** attribution hints when available */
  attribution?: Record<string, unknown>;
  timestamp: number;
}

/** Google CWV thresholds (good / poor boundaries) */
export const VITAL_THRESHOLDS: Record<
  VitalName,
  { good: number; poor: number; unit: 'ms' | 'score' }
> = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  INP: { good: 200, poor: 500, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: 'score' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
};

export function rateVital(name: VitalName, value: number): VitalRating {
  const t = VITAL_THRESHOLDS[name];
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

export function formatVitalValue(name: VitalName, value: number): string {
  const unit = VITAL_THRESHOLDS[name].unit;
  if (unit === 'score') return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)}ms`;
}

const SESSION_KEY = 'hukan_vitals_session';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `vs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `vs_${Date.now().toString(36)}`;
  }
}

export interface VitalReportPayload {
  sessionId: string;
  metrics: VitalMetric[];
  userAgent: string;
  connection?: string;
  deviceMemory?: number;
  url: string;
}

/**
 * Send metrics via sendBeacon when possible (survives page unload).
 * Falls back to fetch keepalive.
 */
export function sendVitals(payload: VitalReportPayload): void {
  const body = JSON.stringify(payload);
  const url = '/api/vitals';

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' });
    const ok = navigator.sendBeacon(url, blob);
    if (ok) return;
  }

  fetch(url, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => {
    // swallow — monitoring must never break the app
  });
}

/** Dev / debug: also push to dataLayer-style buffer */
export function bufferVitalLocally(metric: VitalMetric): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & { __HUKAN_VITALS__?: VitalMetric[] };
  if (!w.__HUKAN_VITALS__) w.__HUKAN_VITALS__ = [];
  w.__HUKAN_VITALS__.push(metric);
  // Cap buffer
  if (w.__HUKAN_VITALS__.length > 50) {
    w.__HUKAN_VITALS__ = w.__HUKAN_VITALS__.slice(-50);
  }
}
