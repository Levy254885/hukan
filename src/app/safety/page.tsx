import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Safety Centre',
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Safety Centre</h1>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        Stay safe when viewing properties: meet in public first when possible, verify agent identity, never pay deposits to personal accounts without a written agreement, and report suspicious listings via the report flow. Hukan does not handle cash on your behalf.
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
