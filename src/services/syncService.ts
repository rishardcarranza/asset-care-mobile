/**
 * Background and On-Demand Synchronization Service.
 * Coordinates local SQLite state with Asset Care cloud API.
 */

import { syncApi } from "../api/client";
import { AssetDao } from "../database/assetDao";
import { LogDao, RuleDao } from "../database/maintenanceDao";
import { SyncMetaDao } from "../database/syncMetaDao";

export interface SyncResult {
  success: boolean;
  pushedCount: number;
  pulledCount: number;
  error?: string;
  syncedAt?: string;
}

export const syncService = {
  /**
   * Run full bidirectional synchronization without blocking the UI.
   */
  async runSync(): Promise<SyncResult> {
    try {
      // 1. Gather pending local mutations
      const pendingAssets = AssetDao.getPendingSync();
      const pendingRules = RuleDao.getPendingSync();
      const pendingLogs = LogDao.getPendingSync();

      let pushedCount = 0;

      // 2. Push pending mutations to backend if any exist
      if (
        pendingAssets.length > 0 ||
        pendingRules.length > 0 ||
        pendingLogs.length > 0
      ) {
        const pushResult = await syncApi.push({
          assets: pendingAssets,
          maintenance_rules: pendingRules,
          maintenance_logs: pendingLogs,
        });

        // Mark local items as synced
        AssetDao.markSynced(pendingAssets.map((a) => a.id));
        RuleDao.markSynced(pendingRules.map((r) => r.id));
        LogDao.markSynced(pendingLogs.map((l) => l.id));

        pushedCount =
          pushResult.applied_assets +
          pushResult.applied_rules +
          pushResult.applied_logs;
      }

      // 3. Pull incremental changes from server
      const lastSynced =
        SyncMetaDao.getLastSyncedAt() || "1970-01-01T00:00:00Z";
      const pullResult = await syncApi.pull(lastSynced);

      // 4. Upsert incoming records into local SQLite
      for (const asset of pullResult.assets) {
        AssetDao.upsert(asset, "synced");
      }
      for (const rule of pullResult.maintenance_rules) {
        RuleDao.upsert(rule, "synced");
      }
      for (const log of pullResult.maintenance_logs) {
        LogDao.upsert(log, "synced");
      }

      // 5. Update local timestamp
      SyncMetaDao.setLastSyncedAt(pullResult.synced_at);

      const pulledCount =
        pullResult.assets.length +
        pullResult.maintenance_rules.length +
        pullResult.maintenance_logs.length;

      return {
        success: true,
        pushedCount,
        pulledCount,
        syncedAt: pullResult.synced_at,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown sync error";
      return {
        success: false,
        pushedCount: 0,
        pulledCount: 0,
        error: errorMessage,
      };
    }
  },
};
