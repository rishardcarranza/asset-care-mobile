/**
 * React hook exposing non-blocking offline synchronization controls and state.
 */

import { useCallback, useEffect, useState } from "react";
import { SyncMetaDao } from "../database/syncMetaDao";
import { syncService, type SyncResult } from "../services/syncService";

export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    SyncMetaDao.getLastSyncedAt()
  );
  const [syncError, setSyncError] = useState<string | null>(null);

  const triggerSync = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const result = await syncService.runSync();
      if (result.success && result.syncedAt) {
        setLastSyncedAt(result.syncedAt);
      } else if (!result.success) {
        setSyncError(result.error || "Sync failed");
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync automatically on mount
  useEffect(() => {
    triggerSync();
  }, [triggerSync]);

  return {
    isSyncing,
    lastSyncedAt,
    syncError,
    triggerSync,
  };
};
