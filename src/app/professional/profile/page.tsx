'use client';

import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/button';

export default function ProfessionalProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Public agent profile shown on your listings
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
        <div>
          <p className="text-muted-foreground">Display name</p>
          <p className="font-medium">{user?.displayName || '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p className="font-medium">{user?.email || '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Role</p>
          <p className="font-medium capitalize">{user?.role || '—'}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Full profile editing (photo, bio, areas served, WhatsApp) will connect to Firebase
        once production auth is wired.
      </p>

      <Button variant="outline" disabled>
        Edit profile (coming soon)
      </Button>
    </div>
  );
}
