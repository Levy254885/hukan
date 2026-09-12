'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getNotifications,
  markRead,
  markAllRead,
  ensureDemoNotifications,
  type AppNotification,
} from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    await ensureDemoNotifications(user.id);
    setItems(await getNotifications(user.id));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Alerts for saved searches, messages and listing updates
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await markAllRead(user.id);
            refresh();
          }}
        >
          Mark all read
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="font-medium">No notifications</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save a search to receive match alerts.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href || '#'}
                onClick={async () => {
                  await markRead(user.id, n.id);
                  refresh();
                }}
                className={cn(
                  'block rounded-lg border px-4 py-3 transition-colors hover:border-primary/40',
                  n.read ? 'border-border bg-card' : 'border-primary/30 bg-primary/5'
                )}
              >
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
