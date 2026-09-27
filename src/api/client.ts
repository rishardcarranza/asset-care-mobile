/**
 * API client strictly bound to the Asset Care backend OpenAPI contract.
 */

import { Platform } from "react-native";
import type {
  Asset,
  MaintenanceLog,
  MaintenanceRule,
} from "../types";

export const getApiBaseUrl = (): string => {
  // Android Emulator uses 10.0.2.2 to access host machine localhost
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8001/api/v1";
  }
  return "http://localhost:8001/api/v1";
};

export interface SyncPullResponse {
  synced_at: string;
  assets: Asset[];
  maintenance_rules: MaintenanceRule[];
  maintenance_logs: MaintenanceLog[];
}

export interface SyncPushRequest {
  assets: Asset[];
  maintenance_rules: MaintenanceRule[];
  maintenance_logs: MaintenanceLog[];
}

export interface SyncPushResponse {
  synced_at: string;
  applied_assets: number;
  applied_rules: number;
  applied_logs: number;
}

export const syncApi = {
  /**
   * Pull incremental changes from backend since the provided UTC timestamp.
   */
  async pull(since: string): Promise<SyncPullResponse> {
    const url = `${getApiBaseUrl()}/sync/pull?since=${encodeURIComponent(since)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sync pull failed (${response.status}): ${errorText}`);
    }

    return response.json();
  },

  /**
   * Push offline batch mutations to backend.
   */
  async push(payload: SyncPushRequest): Promise<SyncPushResponse> {
    const url = `${getApiBaseUrl()}/sync/push`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sync push failed (${response.status}): ${errorText}`);
    }

    return response.json();
  },
};
