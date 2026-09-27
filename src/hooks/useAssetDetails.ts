/**
 * React hook for single asset details, rules, execution logs, and health.
 */

import { useCallback, useEffect, useState } from "react";
import { AssetDao } from "../database/assetDao";
import { LogDao, RuleDao } from "../database/maintenanceDao";
import { calculateAssetHealth } from "../services/healthCalculator";
import { generateUUID } from "./useAssets";
import type {
  Asset,
  AssetHealthReport,
  MaintenanceLog,
  MaintenanceRule,
  MetricType,
} from "../types";

export const useAssetDetails = (assetId: string) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [rules, setRules] = useState<MaintenanceRule[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [health, setHealth] = useState<AssetHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      const a = AssetDao.getById(assetId);
      const r = RuleDao.getByAsset(assetId);
      const l = LogDao.getByAsset(assetId);

      setAsset(a);
      setRules(r);
      setLogs(l);

      if (a) {
        setHealth(calculateAssetHealth(a, r, l));
      }
    } finally {
      setIsLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addRule = useCallback(
    (data: {
      maintenance_type: string;
      metric_type: MetricType;
      interval_value: number;
      metric_unit: string;
      description?: string | null;
    }) => {
      const now = new Date().toISOString();
      const newRule: MaintenanceRule = {
        id: generateUUID(),
        asset_id: assetId,
        maintenance_type: data.maintenance_type,
        metric_type: data.metric_type,
        interval_value: data.interval_value,
        metric_unit: data.metric_unit,
        description: data.description ?? null,
        created_at: now,
        updated_at: now,
        is_deleted: false,
        sync_status: "pending",
      };

      RuleDao.upsert(newRule, "pending");
      loadData();
    },
    [assetId, loadData]
  );

  const deleteRule = useCallback(
    (ruleId: string) => {
      RuleDao.softDelete(ruleId);
      loadData();
    },
    [loadData]
  );

  const recordLog = useCallback(
    (data: {
      maintenance_type: string;
      service_date: string;
      metric_value_at_service?: number | null;
      cost?: number | null;
      notes?: string | null;
      performed_by?: string | null;
    }) => {
      const now = new Date().toISOString();
      const newLog: MaintenanceLog = {
        id: generateUUID(),
        asset_id: assetId,
        maintenance_type: data.maintenance_type,
        service_date: data.service_date,
        metric_value_at_service: data.metric_value_at_service ?? null,
        cost: data.cost ?? null,
        notes: data.notes ?? null,
        performed_by: data.performed_by ?? null,
        created_at: now,
        updated_at: now,
        is_deleted: false,
        sync_status: "pending",
      };

      LogDao.upsert(newLog, "pending");

      // Update asset telemetry if log has a higher odometer reading
      if (asset && data.metric_value_at_service != null) {
        const payload = (asset.metadata_payload || {}) as Record<string, unknown>;
        const currentOdo = Number(payload.last_odometer || 0);
        if (data.metric_value_at_service > currentOdo) {
          const updatedAsset: Asset = {
            ...asset,
            metadata_payload: {
              ...payload,
              last_odometer: data.metric_value_at_service,
            },
            updated_at: now,
            sync_status: "pending",
          };
          AssetDao.upsert(updatedAsset, "pending");
        }
      }

      loadData();
    },
    [asset, assetId, loadData]
  );

  const deleteLog = useCallback(
    (logId: string) => {
      LogDao.softDelete(logId);
      loadData();
    },
    [loadData]
  );

  return {
    asset,
    rules,
    logs,
    health,
    isLoading,
    refresh: loadData,
    addRule,
    deleteRule,
    recordLog,
    deleteLog,
  };
};
