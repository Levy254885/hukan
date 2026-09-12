'use client';

import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardSettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Account preferences</p>
      </div>

      <section className="space-y-2 text-sm">
        <h3 className="font-semibold">Account</h3>
        <p>{user?.displayName}</p>
        <p className="text-muted-foreground">{user?.email}</p>
      </section>

      <section className="space-y-2 border-t border-border pt-6">
        <h3 className="font-semibold">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Email and push preferences will be available once Firebase Cloud Messaging is
          connected.
        </p>
      </section>

      <section className="space-y-2 border-t border-border pt-6">
        <h3 className="font-semibold">Privacy</h3>
        <p className="text-sm text-muted-foreground">
          Saved searches and recently viewed properties are stored locally in this demo.
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
