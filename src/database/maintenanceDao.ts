/**
 * Local Data Access Objects for Maintenance Rules and Execution Logs.
 */

import { db } from "./db";
import type {
  MaintenanceLog,
  MaintenanceRule,
  MetricType,
  SyncStatus,
} from "../types";

interface RuleRow {
  id: string;
  asset_id: string;
  maintenance_type: string;
  metric_type: MetricType;
  interval_value: number;
  metric_unit: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: number;
  sync_status: SyncStatus;
}

interface LogRow {
  id: string;
  asset_id: string;
  maintenance_type: string;
  service_date: string;
  metric_value_at_service: number | null;
  cost: number | null;
  notes: string | null;
  performed_by: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: number;
  sync_status: SyncStatus;
}

const mapRowToRule = (row: RuleRow): MaintenanceRule => ({
  id: row.id,
  asset_id: row.asset_id,
  maintenance_type: row.maintenance_type,
  metric_type: row.metric_type,
  interval_value: row.interval_value,
  metric_unit: row.metric_unit,
  description: row.description,
  created_at: row.created_at,
  updated_at: row.updated_at,
  is_deleted: Boolean(row.is_deleted),
  sync_status: row.sync_status,
});

const mapRowToLog = (row: LogRow): MaintenanceLog => ({
  id: row.id,
  asset_id: row.asset_id,
  maintenance_type: row.maintenance_type,
  service_date: row.service_date,
  metric_value_at_service: row.metric_value_at_service,
  cost: row.cost,
  notes: row.notes,
  performed_by: row.performed_by,
  created_at: row.created_at,
  updated_at: row.updated_at,
  is_deleted: Boolean(row.is_deleted),
  sync_status: row.sync_status,
});

export const RuleDao = {
  getByAsset(assetId: string): MaintenanceRule[] {
    try {
      const rows = db.getAllSync<RuleRow>(
        "SELECT * FROM maintenance_rules WHERE asset_id = ? AND is_deleted = 0 ORDER BY created_at ASC",
        [assetId]
      );
      return rows.map(mapRowToRule);
    } catch (err) {
      console.warn("[RuleDao] Error in getByAsset:", err);
      return [];
    }
  },

  upsert(rule: MaintenanceRule, syncStatus: SyncStatus = "pending"): void {
    try {
      db.runSync(
        `INSERT INTO maintenance_rules (id, asset_id, maintenance_type, metric_type, interval_value, metric_unit, description, created_at, updated_at, is_deleted, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           maintenance_type = excluded.maintenance_type,
           metric_type = excluded.metric_type,
           interval_value = excluded.interval_value,
           metric_unit = excluded.metric_unit,
           description = excluded.description,
           updated_at = excluded.updated_at,
           is_deleted = excluded.is_deleted,
           sync_status = excluded.sync_status`,
        [
          rule.id,
          rule.asset_id,
          rule.maintenance_type,
          rule.metric_type,
          rule.interval_value,
          rule.metric_unit,
          rule.description,
          rule.created_at,
          rule.updated_at,
          rule.is_deleted ? 1 : 0,
          syncStatus,
        ]
      );
    } catch (err) {
      console.error("[RuleDao] Error in upsert:", err);
      throw err;
    }
  },

  softDelete(id: string): void {
    try {
      const now = new Date().toISOString();
      db.runSync(
        "UPDATE maintenance_rules SET is_deleted = 1, sync_status = 'pending', updated_at = ? WHERE id = ?",
        [now, id]
      );
    } catch (err) {
      console.error("[RuleDao] Error in softDelete:", err);
      throw err;
    }
  },

  getPendingSync(): MaintenanceRule[] {
    try {
      const rows = db.getAllSync<RuleRow>(
        "SELECT * FROM maintenance_rules WHERE sync_status = 'pending'"
      );
      return rows.map(mapRowToRule);
    } catch (err) {
      console.warn("[RuleDao] Error in getPendingSync:", err);
      return [];
    }
  },

  markSynced(ids: string[]): void {
    if (ids.length === 0) return;
    try {
      const placeholders = ids.map(() => "?").join(",");
      db.runSync(
        `UPDATE maintenance_rules SET sync_status = 'synced' WHERE id IN (${placeholders})`,
        ids
      );
    } catch (err) {
      console.error("[RuleDao] Error in markSynced:", err);
    }
  },
};

export const LogDao = {
  getByAsset(assetId: string): MaintenanceLog[] {
    try {
      const rows = db.getAllSync<LogRow>(
        "SELECT * FROM maintenance_logs WHERE asset_id = ? AND is_deleted = 0 ORDER BY service_date DESC",
        [assetId]
      );
      return rows.map(mapRowToLog);
    } catch (err) {
      console.warn("[LogDao] Error in getByAsset:", err);
      return [];
    }
  },

  getLatestForType(assetId: string, maintenanceType: string): MaintenanceLog | null {
    try {
      const row = db.getFirstSync<LogRow>(
        "SELECT * FROM maintenance_logs WHERE asset_id = ? AND maintenance_type = ? AND is_deleted = 0 ORDER BY service_date DESC LIMIT 1",
        [assetId, maintenanceType]
      );
      return row ? mapRowToLog(row) : null;
    } catch (err) {
      console.warn("[LogDao] Error in getLatestForType:", err);
      return null;
    }
  },

  upsert(log: MaintenanceLog, syncStatus: SyncStatus = "pending"): void {
    try {
      db.runSync(
        `INSERT INTO maintenance_logs (id, asset_id, maintenance_type, service_date, metric_value_at_service, cost, notes, performed_by, created_at, updated_at, is_deleted, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           maintenance_type = excluded.maintenance_type,
           service_date = excluded.service_date,
           metric_value_at_service = excluded.metric_value_at_service,
           cost = excluded.cost,
           notes = excluded.notes,
           performed_by = excluded.performed_by,
           updated_at = excluded.updated_at,
           is_deleted = excluded.is_deleted,
           sync_status = excluded.sync_status`,
        [
          log.id,
          log.asset_id,
          log.maintenance_type,
          log.service_date,
          log.metric_value_at_service,
          log.cost,
          log.notes,
          log.performed_by,
          log.created_at,
          log.updated_at,
          log.is_deleted ? 1 : 0,
          syncStatus,
        ]
      );
    } catch (err) {
      console.error("[LogDao] Error in upsert:", err);
      throw err;
    }
  },

  softDelete(id: string): void {
    try {
      const now = new Date().toISOString();
      db.runSync(
        "UPDATE maintenance_logs SET is_deleted = 1, sync_status = 'pending', updated_at = ? WHERE id = ?",
        [now, id]
      );
    } catch (err) {
      console.error("[LogDao] Error in softDelete:", err);
      throw err;
    }
  },

  getPendingSync(): MaintenanceLog[] {
    try {
      const rows = db.getAllSync<LogRow>(
        "SELECT * FROM maintenance_logs WHERE sync_status = 'pending'"
      );
      return rows.map(mapRowToLog);
    } catch (err) {
      console.warn("[LogDao] Error in getPendingSync:", err);
      return [];
    }
  },

  markSynced(ids: string[]): void {
    if (ids.length === 0) return;
    try {
      const placeholders = ids.map(() => "?").join(",");
      db.runSync(
        `UPDATE maintenance_logs SET sync_status = 'synced' WHERE id IN (${placeholders})`,
        ids
      );
    } catch (err) {
      console.error("[LogDao] Error in markSynced:", err);
    }
  },
};
