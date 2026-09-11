import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Hukan',
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">About Hukan</h1>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        Hukan is a Kenyan property discovery and marketplace platform connecting buyers, renters, landlords, agents, agencies, and developers across all 47 counties. Our goal is a trustworthy, mobile-first experience.
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
