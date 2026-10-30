/**
 * React hook exposing non-blocking offline synchronization controls and state.
 */

import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { SyncMetaDao } from "../database/syncMetaDao";
import { syncService, type SyncResult } from "../services/syncService";

export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    SyncMetaDao.getLastSyncedAt()
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const triggerSync = useCallback(
    async (options?: { showAlertOnError?: boolean }): Promise<SyncResult> => {
      const showAlert = options?.showAlertOnError ?? true;
      setIsSyncing(true);
      setSyncError(null);
      try {
        const result = await syncService.runSync();
        if (result.success && result.syncedAt) {
          setLastSyncedAt(result.syncedAt);
          setIsOnline(true);
        } else if (!result.success) {
          const errMessage = result.error || "Sync failed";
          setSyncError(errMessage);
          setIsOnline(false);
          if (showAlert) {
            Alert.alert("Sync Failed", errMessage);
          }
        }
        return result;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Background sync automatically on mount (silent on error)
  useEffect(() => {
    triggerSync({ showAlertOnError: false });
  }, [triggerSync]);

  return {
    isSyncing,
    isOnline,
    lastSyncedAt,
    syncError,
    triggerSync,
  };
};
