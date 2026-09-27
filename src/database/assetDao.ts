/**
 * Local Data Access Object for Physical Assets in SQLite.
 */

import { db } from "./db";
import type { Asset, AssetType, SyncStatus } from "../types";

interface AssetRow {
  id: string;
  name: string;
  asset_type: AssetType;
  description: string | null;
  metadata_payload: string;
  created_at: string;
  updated_at: string;
  is_deleted: number;
  sync_status: SyncStatus;
}

const mapRowToAsset = (row: AssetRow): Asset => ({
  id: row.id,
  name: row.name,
  asset_type: row.asset_type,
  description: row.description,
  metadata_payload: JSON.parse(row.metadata_payload || "{}"),
  created_at: row.created_at,
  updated_at: row.updated_at,
  is_deleted: Boolean(row.is_deleted),
  sync_status: row.sync_status,
});

export const AssetDao = {
  /**
   * Fetch all active assets from local SQLite.
   */
  getAll(): Asset[] {
    try {
      const rows = db.getAllSync<AssetRow>(
        "SELECT * FROM assets WHERE is_deleted = 0 ORDER BY created_at DESC"
      );
      return rows.map(mapRowToAsset);
    } catch (err) {
      console.warn("[AssetDao] Error in getAll:", err);
      return [];
    }
  },

  /**
   * Fetch assets filtered by category.
   */
  getByType(type: AssetType): Asset[] {
    try {
      const rows = db.getAllSync<AssetRow>(
        "SELECT * FROM assets WHERE asset_type = ? AND is_deleted = 0 ORDER BY created_at DESC",
        [type]
      );
      return rows.map(mapRowToAsset);
    } catch (err) {
      console.warn("[AssetDao] Error in getByType:", err);
      return [];
    }
  },

  /**
   * Fetch single asset by ID.
   */
  getById(id: string): Asset | null {
    try {
      const row = db.getFirstSync<AssetRow>(
        "SELECT * FROM assets WHERE id = ? AND is_deleted = 0",
        [id]
      );
      return row ? mapRowToAsset(row) : null;
    } catch (err) {
      console.warn("[AssetDao] Error in getById:", err);
      return null;
    }
  },

  /**
   * Insert or update asset locally in SQLite.
   */
  upsert(asset: Asset, syncStatus: SyncStatus = "pending"): void {
    try {
      const metadataStr = JSON.stringify(asset.metadata_payload || {});
      db.runSync(
        `INSERT INTO assets (id, name, asset_type, description, metadata_payload, created_at, updated_at, is_deleted, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           asset_type = excluded.asset_type,
           description = excluded.description,
           metadata_payload = excluded.metadata_payload,
           updated_at = excluded.updated_at,
           is_deleted = excluded.is_deleted,
           sync_status = excluded.sync_status`,
        [
          asset.id,
          asset.name,
          asset.asset_type,
          asset.description,
          metadataStr,
          asset.created_at,
          asset.updated_at,
          asset.is_deleted ? 1 : 0,
          syncStatus,
        ]
      );
    } catch (err) {
      console.error("[AssetDao] Error in upsert:", err);
      throw err;
    }
  },

  /**
   * Soft-delete an asset locally and mark for sync.
   */
  softDelete(id: string): void {
    try {
      const now = new Date().toISOString();
      db.runSync(
        "UPDATE assets SET is_deleted = 1, sync_status = 'pending', updated_at = ? WHERE id = ?",
        [now, id]
      );
    } catch (err) {
      console.error("[AssetDao] Error in softDelete:", err);
      throw err;
    }
  },

  /**
   * Retrieve all mutations that haven't been synchronized to backend.
   */
  getPendingSync(): Asset[] {
    try {
      const rows = db.getAllSync<AssetRow>(
        "SELECT * FROM assets WHERE sync_status = 'pending'"
      );
      return rows.map(mapRowToAsset);
    } catch (err) {
      console.warn("[AssetDao] Error in getPendingSync:", err);
      return [];
    }
  },

  /**
   * Mark local records as synced.
   */
  markSynced(ids: string[]): void {
    if (ids.length === 0) return;
    try {
      const placeholders = ids.map(() => "?").join(",");
      db.runSync(
        `UPDATE assets SET sync_status = 'synced' WHERE id IN (${placeholders})`,
        ids
      );
    } catch (err) {
      console.error("[AssetDao] Error in markSynced:", err);
    }
  },
};
