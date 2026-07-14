import { useState, useEffect, useMemo, useCallback } from 'react';
import type { HalloWeltEintrag } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [halloWeltEintrag, setHalloWeltEintrag] = useState<HalloWeltEintrag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [halloWeltEintragData] = await Promise.all([
        LivingAppsService.getHalloWeltEintrag(),
      ]);
      setHalloWeltEintrag(halloWeltEintragData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [halloWeltEintragData] = await Promise.all([
          LivingAppsService.getHalloWeltEintrag(),
        ]);
        setHalloWeltEintrag(halloWeltEintragData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  return { halloWeltEintrag, setHalloWeltEintrag, loading, error, fetchAll };
}