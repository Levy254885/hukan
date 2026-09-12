'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', label: 'Home', icon: Home, exact: true },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/dashboard/saved', label: 'Saved', icon: Heart },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard', label: 'Account', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on professional/admin shells and list-property wizard
  if (
    pathname.startsWith('/professional') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/list-property') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup')
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/90 backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.25px]')} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
