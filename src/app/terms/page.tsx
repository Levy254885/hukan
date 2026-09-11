import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        These are placeholder terms of service for Hukan. They do not constitute legal advice. Engage Kenyan counsel before relying on this text in production. Users must list only properties they are authorised to market.
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
