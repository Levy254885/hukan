'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { AdminNav } from '@/components/admin/AdminNav';

const ADMIN_ROLES = new Set(['admin', 'super_admin', 'moderator']);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/signin');
      return;
    }
    if (!ADMIN_ROLES.has(user.role)) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !ADMIN_ROLES.has(user.role)) return null;

  return (
    <div className="hukan-section py-8 animate-slide-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Marketplace moderation & operations
          </p>
        </div>
        <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-medium text-danger">
          {user.role}
        </span>
      </div>
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
