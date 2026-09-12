'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/professional', label: 'Overview', exact: true },
  { href: '/professional/listings', label: 'Listings' },
  { href: '/professional/leads', label: 'Leads' },
  { href: '/professional/viewings', label: 'Viewings' },
  { href: '/professional/analytics', label: 'Analytics' },
  { href: '/professional/billing', label: 'Billing' },
  { href: '/professional/profile', label: 'Profile' },
];

export function ProfessionalNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(link.href + '/');
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
