import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help Centre',
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Help Centre</h1>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        Search properties from the homepage or Search tab. Save homes with the heart icon (sign in required). Contact agents via WhatsApp, call, enquiry, or viewing request on each listing. Professionals can publish listings from Post Property.
      </p>
      <p className="mt-6 text-xs text-muted-foreground">
        Placeholder content — review with legal counsel before production use.
      </p>
      <Link href="/" className="mt-8 inline-block text-sm font-medium text-primary hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
