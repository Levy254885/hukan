'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Property } from '@/types';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getSavedProperties,
  toggleSavedProperty,
  isPropertySaved,
} from '@/services/savedPropertyService';

export function useSavedProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setProperties([]);
      setSavedIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    const list = await getSavedProperties(user.id);
    setProperties(list);
    setSavedIds(new Set(list.map((p) => p.id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (propertyId: string) => {
      if (!user) return false;
      const nowSaved = await toggleSavedProperty(user.id, propertyId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (nowSaved) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
      if (!nowSaved) {
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      } else {
        refresh();
      }
      return nowSaved;
    },
    [user, refresh]
  );

  const isSaved = useCallback(
    (propertyId: string) => savedIds.has(propertyId),
    [savedIds]
  );

  return {
    properties,
    loading,
    count: properties.length,
    toggle,
    isSaved,
    refresh,
  };
}
