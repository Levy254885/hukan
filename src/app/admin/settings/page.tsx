'use client';

import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Admin settings</h2>
        <p className="text-sm text-muted-foreground">Platform configuration</p>
      </div>

      <section className="space-y-2 text-sm">
        <h3 className="font-semibold">Signed in as</h3>
        <p>{user?.displayName} ({user?.email})</p>
        <p className="capitalize text-muted-foreground">Role: {user?.role}</p>
      </section>

      <section className="space-y-2 border-t border-border pt-6">
        <h3 className="font-semibold">Platform</h3>
        <p className="text-sm text-muted-foreground">
          Featured listing durations, subscription plans, and payment providers will be
          configurable here once billing is connected. Do not hardcode prices in the UI.
        </p>
      </section>

      <section className="space-y-2 border-t border-border pt-6">
        <h3 className="font-semibold">Security</h3>
        <p className="text-sm text-muted-foreground">
          Admin routes are role-gated on the client. Production must enforce the same
          checks in Firebase Security Rules and Cloud Functions — never trust client role alone.
        </p>
      </section>

      <Button
        variant="outline"
        onClick={async () => {
          await signOut();
          router.push('/');
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
