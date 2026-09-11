'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="hukan-section py-8 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Hello{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">Manage your property search</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <DashboardNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
