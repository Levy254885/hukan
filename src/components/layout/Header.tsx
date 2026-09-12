'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthProvider';
import { cn } from '@/lib/utils';
import { User, Heart, LogOut, LayoutDashboard } from 'lucide-react';

const navItems = [
  { href: '/search?purpose=buy', label: 'Buy' },
  { href: '/search?purpose=rent', label: 'Rent' },
  { href: '/search?purpose=land', label: 'Land' },
  { href: '/search?purpose=commercial', label: 'Commercial' },
  { href: '/developments', label: 'New Developments' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105">
            H
          </span>
          <span className="text-xl text-foreground">Hukan</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/list-property" className="hidden sm:block">
            <Button variant="outline" size="sm">
              Post Property
            </Button>
          </Link>

          {!loading && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
              >
                <User className="h-4 w-4" />
                <span className="hidden max-w-[100px] truncate sm:inline">
                  {user.displayName || user.email.split('@')[0]}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-border bg-card py-1 shadow-lg">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/saved"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Saved properties
                    </Link>
                    <Link
                      href="/messages"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Messages
                    </Link>
                    <Link
                      href="/professional"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Professional portal
                    </Link>
                    {user.role === 'admin' || user.role === 'super_admin' || user.role === 'moderator' ? (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        onClick={() => setMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-muted"
                      onClick={async () => {
                        setMenuOpen(false);
                        await signOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/signin">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

          <button
            className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className={cn('border-t border-border md:hidden', mobileOpen ? 'block' : 'hidden')}>
        <nav className="flex flex-col space-y-1 px-4 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/list-property"
            className="rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted"
            onClick={() => setMobileOpen(false)}
          >
            Post Property
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
