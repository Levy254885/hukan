'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { getAdminUsers, updateUserStatus, type AdminUser } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setUsers(await getAdminUsers());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function setStatus(userId: string, status: AdminUser['status']) {
    if (!user) return;
    if (userId === user.id) {
      alert('You cannot change your own status');
      return;
    }
    await updateUserStatus(user.id, userId, status);
    refresh();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">{users.length} accounts</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Listings</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.role.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs capitalize',
                        u.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      )}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{u.listingsCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(u.id, 'suspended')}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setStatus(u.id, 'active')}>
                          Reinstate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
