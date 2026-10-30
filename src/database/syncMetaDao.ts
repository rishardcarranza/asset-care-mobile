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

  /**
   * Get custom API URL configured by user, if any.
   */
  getCustomApiUrl(): string | null {
    try {
      const row = db.getFirstSync<MetaRow>(
        "SELECT value FROM sync_metadata WHERE key = 'custom_api_url'"
      );
      return row ? row.value : null;
    } catch (err) {
      console.warn("[SyncMetaDao] Could not read custom_api_url:", err);
      return null;
    }
  },

  /**
   * Set or remove custom API URL.
   */
  setCustomApiUrl(url: string | null): void {
    try {
      if (!url || url.trim() === "") {
        db.runSync("DELETE FROM sync_metadata WHERE key = 'custom_api_url'");
      } else {
        db.runSync(
          `INSERT INTO sync_metadata (key, value) VALUES ('custom_api_url', ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
          [url.trim()]
        );
      }
    } catch (err) {
      console.warn("[SyncMetaDao] Could not write custom_api_url:", err);
    }
  },
};
