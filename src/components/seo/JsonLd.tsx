import { jsonLdScript } from '@/lib/seo/structured-data';

/** Server-safe JSON-LD injector */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }}
    />
  );
}
