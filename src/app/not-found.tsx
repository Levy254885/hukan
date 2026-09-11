import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">Property or page not found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        It may have been removed or the link is incorrect.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button>Go home</Button>
        </Link>
        <Link href="/search">
          <Button variant="outline">Search properties</Button>
        </Link>
      </div>
    </div>
  );
}
