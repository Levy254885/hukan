'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProfessionalNav } from '@/components/professional/ProfessionalNav';

const PRO_ROLES = new Set([
  'agent',
  'agency_admin',
  'agency_agent',
  'developer',
  'developer_staff',
  'property_manager',
  'owner',
  'landlord',
  'admin',
  'super_admin',
]);

export default function ProfessionalLayout({
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
    // Allow buyers to access for demo; in production gate by PRO_ROLES
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Professional portal</h1>
          <p className="text-sm text-muted-foreground">
            Manage listings, leads and performance
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
          {user.role.replace('_', ' ')}
        </span>
      </div>
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <ProfessionalNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
