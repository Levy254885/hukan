'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  Search,
  MessageSquare,
  Calendar,
  Bell,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/saved', label: 'Saved properties', icon: Heart },
  { href: '/dashboard/searches', label: 'Saved searches', icon: Search },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/enquiries', label: 'Enquiries', icon: MessageSquare },
  { href: '/dashboard/viewings', label: 'Viewings', icon: Calendar },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border pb-px lg:flex-col lg:gap-0.5 lg:border-b-0 lg:border-r lg:pr-4">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
