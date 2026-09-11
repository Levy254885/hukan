'use client';

import { useEffect, useState } from 'react';
import { getAdminUsers, type AdminUser } from '@/services/adminService';
import { cn } from '@/lib/utils';

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminUsers().then((users) => {
      setAgents(
        users.filter((u) =>
          ['agent', 'agency_agent', 'agency_admin'].includes(u.role)
        )
      );
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Agents</h2>
        <p className="text-sm text-muted-foreground">
          Property professionals on the platform
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : agents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No agents found</p>
      ) : (
        <ul className="space-y-3">
          {agents.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{a.displayName}</p>
                  {a.isVerified && (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {a.email} · {a.phone || 'No phone'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {a.role.replace('_', ' ')} · {a.listingsCount} listings
                </p>
              </div>
              <span
                className={cn(
                  'self-start rounded-full px-2 py-0.5 text-xs capitalize',
                  a.status === 'active'
                    ? 'bg-success/10 text-success'
                    : 'bg-danger/10 text-danger'
                )}
              >
                {a.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
