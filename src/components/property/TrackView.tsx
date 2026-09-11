'use client';

import { useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { trackPropertyView } from '@/services/recentlyViewedService';

export function TrackView({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();

  useEffect(() => {
    trackPropertyView(user?.id ?? null, propertyId);
  }, [user?.id, propertyId]);

  return null;
}
