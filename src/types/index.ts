/**
 * Core domain types and contract interfaces for Asset Care.
 * Strictly mirrors the backend openapi.json specification.
 */

export type AssetType = "vehicle" | "motorcycle" | "hvac" | "appliance" | "other";

export type MetricType = "odometer" | "time_days" | "time_months" | "usage_hours";

export type MaintenanceStatus = "ok" | "due_soon" | "overdue";

export type SyncStatus = "synced" | "pending";

export interface VehicleMetadata {
  engine?: string | null;
  oil_type?: string | null;
  last_odometer: number;
  odometer_unit: "km" | "mi";
  vin?: string | null;
  transmission?: string | null;
}

export interface MotorcycleMetadata {
  displacement_cc?: number | null;
  drive_type: "chain" | "belt" | "shaft";
  cooling_type: "air" | "liquid" | "oil";
  engine?: string | null;
  oil_type?: string | null;
  last_odometer: number;
  odometer_unit: "km" | "mi";
  vin?: string | null;
  transmission?: string | null;
}

export interface HVACMetadata {
  btu?: number | null;
  refrigerant?: string | null;
  filter_type?: string | null;
  installation_date?: string | null;
}

export interface ApplianceMetadata {
  brand?: string | null;
  model_number?: string | null;
  serial_number?: string | null;
  voltage?: string | null;
  warranty_until?: string | null;
}

export type DynamicMetadataPayload =
  | VehicleMetadata
  | MotorcycleMetadata
  | HVACMetadata
  | ApplianceMetadata
  | Record<string, unknown>;

export interface Asset {
  id: string;
  name: string;
  asset_type: AssetType;
  description: string | null;
  metadata_payload: DynamicMetadataPayload;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  sync_status?: SyncStatus;
}

export interface MaintenanceRule {
  id: string;
  asset_id: string;
  maintenance_type: string;
  metric_type: MetricType;
  interval_value: number;
  metric_unit: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  sync_status?: SyncStatus;
}

export interface MaintenanceLog {
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
  is_deleted: boolean;
  sync_status?: SyncStatus;
}

export interface MaintenanceHealthItem {
  rule_id: string;
  maintenance_type: string;
  metric_type: MetricType;
  interval_value: number;
  metric_unit: string;
  current_reading: number;
  last_service_date: string | null;
  last_service_metric: number | null;
  remaining_value: number;
  percentage_used: number;
  status: MaintenanceStatus;
}

export interface AssetHealthReport {
  asset_id: string;
  asset_name: string;
  overall_status: MaintenanceStatus;
  rules_count: number;
  items: MaintenanceHealthItem[];
}
