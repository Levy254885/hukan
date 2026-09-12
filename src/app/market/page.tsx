import Link from 'next/link';
import { listAreasWithData, getAreaMarketSummary } from '@/services/marketService';
import { formatPrice } from '@/lib/utils';

export const metadata = {
  title: 'Market insights',
  description: 'Market figures calculated from Hukan listings only',
};

export default function MarketPage() {
  const areas = listAreasWithData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Market insights</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Summaries are calculated only from properties listed on Hukan. We do not invent
        city-wide statistics or claim official valuations.
      </p>

      {areas.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border p-12 text-center">
          <p className="font-medium">Hukan is collecting market data</p>
          <p className="mt-2 text-sm text-muted-foreground">
            As more verified listings are published, area medians and trends will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          {areas.map((a) => {
            const summary = getAreaMarketSummary(a.area);
            if (!summary) return null;
            return (
              <article
                key={a.area}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {summary.area}
                      <span className="ml-2 text-base font-normal text-muted-foreground">
                        {summary.county}
                      </span>
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Sample: {summary.sampleSize} listing
                      {summary.sampleSize === 1 ? '' : 's'} on Hukan
                    </p>
                  </div>
                  <Link
                    href={`/search?location=${encodeURIComponent(summary.area)}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View listings →
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat
                    label="Median rent"
                    value={
                      summary.medianRentKes
                        ? formatPrice(summary.medianRentKes, 'KES', 'month')
                        : '—'
                    }
                  />
                  <Stat
                    label="Median sale"
                    value={
                      summary.medianSaleKes
                        ? formatPrice(summary.medianSaleKes, 'KES')
                        : '—'
                    }
                  />
                  <Stat label="For rent" value={String(summary.forRent)} />
                  <Stat label="For sale / land" value={String(summary.forSale)} />
                </div>

                {summary.topPropertyTypes.length > 0 && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Common types:{' '}
                    {summary.topPropertyTypes
                      .map((t) => `${t.type.replace(/_/g, ' ')} (${t.count})`)
                      .join(' · ')}
                  </p>
                )}

                <p className="mt-3 text-xs text-muted-foreground">{summary.dataNote}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
