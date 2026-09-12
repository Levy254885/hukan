import { NextRequest, NextResponse } from 'next/server';
import type { VitalReportPayload, VitalMetric } from '@/lib/performance/web-vitals';

export const runtime = 'edge';

/**
 * Receives Core Web Vitals beacons from the client.
 *
 * Production: forward to your analytics stack (GA4 measurement protocol,
 * BigQuery, Datadog, Vercel Analytics, etc.). Never block or throw to clients.
 */

const MAX_METRICS_PER_REQUEST = 10;
const ALLOWED_NAMES = new Set(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']);

function sanitizeMetric(m: unknown): VitalMetric | null {
  if (!m || typeof m !== 'object') return null;
  const x = m as Record<string, unknown>;
  if (typeof x.name !== 'string' || !ALLOWED_NAMES.has(x.name)) return null;
  if (typeof x.value !== 'number' || !Number.isFinite(x.value)) return null;
  if (typeof x.path !== 'string') return null;

  return {
    name: x.name as VitalMetric['name'],
    value: x.value,
    rating: (x.rating as VitalMetric['rating']) || 'needs-improvement',
    delta: typeof x.delta === 'number' ? x.delta : x.value,
    id: typeof x.id === 'string' ? x.id.slice(0, 64) : 'unknown',
    navigationType: typeof x.navigationType === 'string' ? x.navigationType : undefined,
    path: x.path.slice(0, 256),
    timestamp: typeof x.timestamp === 'number' ? x.timestamp : Date.now(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: unknown;

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      // sendBeacon may send as text/plain depending on browser
      const text = await req.text();
      body = JSON.parse(text);
    }

    const payload = body as Partial<VitalReportPayload>;
    if (!payload || !Array.isArray(payload.metrics)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const metrics = payload.metrics
      .slice(0, MAX_METRICS_PER_REQUEST)
      .map(sanitizeMetric)
      .filter((m): m is VitalMetric => m !== null);

    if (!metrics.length) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const sessionId =
      typeof payload.sessionId === 'string' ? payload.sessionId.slice(0, 64) : 'unknown';

    // Structured log — visible in Vercel / Node logs; swap for real sink later
    for (const metric of metrics) {
      console.info(
        JSON.stringify({
          type: 'web_vital',
          sessionId,
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          path: metric.path,
          ua: typeof payload.userAgent === 'string' ? payload.userAgent.slice(0, 180) : undefined,
          connection: payload.connection,
          deviceMemory: payload.deviceMemory,
          ts: metric.timestamp,
        })
      );
    }

    // Hook: forward to GA4 / analytics when env is set
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (gaId && process.env.GA_API_SECRET) {
      // Placeholder — implement Measurement Protocol in production
      // await sendToGA4(gaId, metrics)
    }

    return NextResponse.json({ ok: true, received: metrics.length });
  } catch {
    // Always 204-style success from client POV so retries don't spam
    return NextResponse.json({ ok: false }, { status: 204 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'hukan-web-vitals',
    metrics: ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'],
    status: 'ok',
  });
}
