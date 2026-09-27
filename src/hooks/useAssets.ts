/**
 * React hook for reading and mutating assets locally via SQLite.
 */

import { useCallback, useEffect, useState } from "react";
import { AssetDao } from "../database/assetDao";
import { LogDao, RuleDao } from "../database/maintenanceDao";
import { calculateAssetHealth } from "../services/healthCalculator";
import type {
  Asset,
  AssetHealthReport,
  AssetType,
  DynamicMetadataPayload,
} from "../types";

export interface AssetWithHealth {
  asset: Asset;
  health: AssetHealthReport;
}

export const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useAssets = (filterType?: AssetType) => {
  const [items, setItems] = useState<AssetWithHealth[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAssets = useCallback(() => {
    setIsLoading(true);
    try {
      const rawAssets = filterType
        ? AssetDao.getByType(filterType)
        : AssetDao.getAll();

      const assetsWithHealth: AssetWithHealth[] = rawAssets.map((asset) => {
        const rules = RuleDao.getByAsset(asset.id);
        const logs = LogDao.getByAsset(asset.id);
        const health = calculateAssetHealth(asset, rules, logs);
        return { asset, health };
      });

      setItems(assetsWithHealth);
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const createAsset = useCallback(
    (data: {
      name: string;
      asset_type: AssetType;
      description?: string | null;
      metadata_payload?: DynamicMetadataPayload;
    }): Asset => {
      const now = new Date().toISOString();
      const newAsset: Asset = {
        id: generateUUID(),
        name: data.name,
        asset_type: data.asset_type,
        description: data.description ?? null,
        metadata_payload: data.metadata_payload ?? {},
        created_at: now,
        updated_at: now,
        is_deleted: false,
        sync_status: "pending",
      };

      AssetDao.upsert(newAsset, "pending");
      loadAssets();
      return newAsset;
    },
    [loadAssets]
  );

  const deleteAsset = useCallback(
    (id: string): void => {
      AssetDao.softDelete(id);
      loadAssets();
    },
    [loadAssets]
  );

  return {
    items,
    isLoading,
    refresh: loadAssets,
    createAsset,
    deleteAsset,
  };
};
