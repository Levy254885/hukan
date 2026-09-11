'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Users,
  ShieldCheck,
  AlertTriangle,
  Settings,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/properties', label: 'Properties', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/agents', label: 'Agents', icon: UserCheck },
  { href: '/admin/verification', label: 'Verification', icon: ShieldCheck },
  { href: '/admin/fraud', label: 'Fraud & Reports', icon: AlertTriangle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNav() {
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
