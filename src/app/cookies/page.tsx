import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy',
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        Hukan may use essential cookies for authentication and preferences, and analytics cookies to improve the product. You can control non-essential cookies in your browser settings.
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
