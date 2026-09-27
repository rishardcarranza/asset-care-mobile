/**
 * SQLite local database connection and schema initialization.
 * Powered by expo-sqlite for 100% offline persistence.
 */

import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("asset_care.db");

/**
 * Initialize database schema, tables, and performance indices.
 * Safe to call multiple times (idempotent).
 */
export const initLocalDatabase = (): void => {
  try {
    db.execSync(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;

      -- Assets table
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        description TEXT,
        metadata_payload TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      );
      CREATE INDEX IF NOT EXISTS ix_local_assets_type ON assets(asset_type);
      CREATE INDEX IF NOT EXISTS ix_local_assets_sync ON assets(sync_status);
      CREATE INDEX IF NOT EXISTS ix_local_assets_deleted ON assets(is_deleted);

      -- Maintenance Rules table
      CREATE TABLE IF NOT EXISTS maintenance_rules (
        id TEXT PRIMARY KEY NOT NULL,
        asset_id TEXT NOT NULL,
        maintenance_type TEXT NOT NULL,
        metric_type TEXT NOT NULL,
        interval_value REAL NOT NULL,
        metric_unit TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS ix_local_rules_asset ON maintenance_rules(asset_id);
      CREATE INDEX IF NOT EXISTS ix_local_rules_sync ON maintenance_rules(sync_status);

      -- Maintenance Logs table
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id TEXT PRIMARY KEY NOT NULL,
        asset_id TEXT NOT NULL,
        maintenance_type TEXT NOT NULL,
        service_date TEXT NOT NULL,
        metric_value_at_service REAL,
        cost REAL,
        notes TEXT,
        performed_by TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS ix_local_logs_asset ON maintenance_logs(asset_id);
      CREATE INDEX IF NOT EXISTS ix_local_logs_sync ON maintenance_logs(sync_status);

      -- Sync Metadata table (stores last_synced_at)
      CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  } catch (error) {
    console.error("[Database] Error initializing local SQLite database:", error);
  }
};

// Immediately execute schema setup so tables are available before any query runs
initLocalDatabase();
