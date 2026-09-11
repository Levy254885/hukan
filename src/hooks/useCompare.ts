'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCompareIds,
  toggleCompare as toggleCompareSvc,
  clearCompare,
  getCompareProperties,
} from '@/services/compareService';
import type { Property } from '@/types';

export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const refresh = useCallback(async () => {
    const nextIds = getCompareIds();
    setIds(nextIds);
    setProperties(await getCompareProperties());
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('hukan:compare-changed', handler);
    return () => window.removeEventListener('hukan:compare-changed', handler);
  }, [refresh]);

  const isCompared = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (propertyId: string) => {
      const result = toggleCompareSvc(propertyId);
      refresh();
      return result;
    },
    [refresh]
  );

  const clear = useCallback(() => {
    clearCompare();
    refresh();
  }, [refresh]);

  return {
    ids,
    properties,
    count: ids.length,
    isCompared,
    toggle,
    clear,
    refresh,
  };
}
