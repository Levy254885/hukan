import { Metadata } from 'next';
import { searchProperties } from '@/services/propertyService';
import { SearchResultsClient } from '@/components/search/SearchResultsClient';
import { parseNaturalLanguageQuery } from '@/lib/search/NaturalLanguageSearchService';
import type { SearchFilters } from '@/types';
import { buildSearchMetadata } from '@/lib/seo/metadata';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const get = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };
  return buildSearchMetadata({
    purpose: get('purpose'),
    location: get('location'),
    q: get('q'),
  });
}

function parseFilters(params: Record<string, string | string[] | undefined>): SearchFilters {
  const get = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  // Natural language query takes precedence when present
  const q = get('q');
  if (q && q.length > 3) {
    const parsed = parseNaturalLanguageQuery(q);
    return {
      ...parsed.filters,
      page: get('page') ? Number(get('page')) : 1,
      limit: 20,
    };
  }

  return {
    purpose: (get('purpose') as SearchFilters['purpose']) || 'rent',
    location: get('location') || undefined,
    propertyTypes: get('propertyType') ? [get('propertyType') as any] : undefined,
    bedrooms: get('beds') ? Number(get('beds')) : undefined,
    minPrice: get('minPrice') ? Number(get('minPrice')) : undefined,
    maxPrice: get('maxPrice') ? Number(get('maxPrice')) : undefined,
    sort: (get('sort') as SearchFilters['sort']) || 'recommended',
    page: get('page') ? Number(get('page')) : 1,
    limit: 20,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const result = await searchProperties(filters);

  const purposeLabel =
    filters.purpose === 'buy'
      ? 'for sale'
      : filters.purpose === 'rent'
        ? 'to rent'
        : filters.purpose === 'land'
          ? 'land'
          : 'commercial';

  const q = Array.isArray(params.q) ? params.q[0] : params.q;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {q ? (
                <>Results for “{q}”</>
              ) : (
                <>
                  Properties {purposeLabel}
                  {filters.location ? ` in ${filters.location}` : ''}
                </>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              {result.total} {result.total === 1 ? 'property' : 'properties'} found
              {filters.bedrooms ? ` · ${filters.bedrooms}+ beds` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <SearchResultsClient
          initialProperties={result.properties}
          total={result.total}
          filters={filters}
        />
      </div>
    </div>
  );
}
