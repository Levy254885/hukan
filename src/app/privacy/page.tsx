import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        This is a placeholder privacy policy for Hukan. Before production launch, this document must be reviewed and finalised by a qualified Kenyan legal professional. Hukan intends to process account, listing, and enquiry data solely to operate the marketplace.
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
