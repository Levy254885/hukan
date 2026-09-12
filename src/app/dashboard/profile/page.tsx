'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-lg font-semibold">Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
          />
        </div>
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium">
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 7XX XXX XXX"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Role</label>
          <p className="text-sm capitalize text-muted-foreground">{user.role.replace('_', ' ')}</p>
        </div>
        <Button type="submit" disabled={status === 'saving'}>
          {status === 'saved' ? 'Saved' : status === 'saving' ? 'Saving…' : 'Save changes'}
        </Button>
        {status === 'error' && (
          <p className="text-sm text-danger">Could not save. Try again.</p>
        )}
      </form>
    </div>
  );
}
