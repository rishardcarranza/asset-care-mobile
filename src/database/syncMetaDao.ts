/**
 * SQLite DAO managing synchronization timestamps and client state.
 */

import { db } from "./db";

interface MetaRow {
  key: string;
  value: string;
}

export const SyncMetaDao = {
  /**
   * Get the timestamp of the last successful synchronization.
   * Returns null if uninitialized or if an error occurs.
   */
  getLastSyncedAt(): string | null {
    try {
      const row = db.getFirstSync<MetaRow>(
        "SELECT value FROM sync_metadata WHERE key = 'last_synced_at'"
      );
      return row ? row.value : null;
    } catch (err) {
      console.warn("[SyncMetaDao] Could not read last_synced_at:", err);
      return null;
    }
  },

  /**
   * Update the last sync timestamp.
   */
  setLastSyncedAt(timestamp: string): void {
    try {
      db.runSync(
        `INSERT INTO sync_metadata (key, value) VALUES ('last_synced_at', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [timestamp]
      );
    } catch (err) {
      console.warn("[SyncMetaDao] Could not write last_synced_at:", err);
    }
  },
};
