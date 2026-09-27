/**
 * Offline-first preventive maintenance health calculation engine.
 * Matches backend MaintenanceSchedulerService calculation formulas exactly.
 */

import type {
  Asset,
  AssetHealthReport,
  MaintenanceHealthItem,
  MaintenanceLog,
  MaintenanceRule,
  MaintenanceStatus,
} from "../types";

export const computeStatus = (
  consumed: number,
  interval: number
): MaintenanceStatus => {
  if (interval <= 0) return "overdue";
  const ratio = consumed / interval;
  if (ratio >= 1.0) return "overdue";
  if (ratio >= 0.9) return "due_soon";
  return "ok";
};

export const calculateAssetHealth = (
  asset: Asset,
  rules: MaintenanceRule[],
  logs: MaintenanceLog[]
): AssetHealthReport => {
  const now = new Date();
  const items: MaintenanceHealthItem[] = [];
  let overall: MaintenanceStatus = "ok";

  for (const rule of rules) {
    // Find the latest service log for this rule's maintenance type
    const matchingLogs = logs
      .filter((l) => l.maintenance_type === rule.maintenance_type)
      .sort(
        (a, b) =>
          new Date(b.service_date).getTime() - new Date(a.service_date).getTime()
      );
    const latestLog = matchingLogs[0] ?? null;

    let consumed = 0;
    let currentReading = 0;
    const lastDate = latestLog?.service_date ?? null;
    const lastMetric = latestLog?.metric_value_at_service ?? null;

    const payload = (asset.metadata_payload || {}) as Record<string, unknown>;

    if (rule.metric_type === "odometer") {
      currentReading = Number(payload.last_odometer || 0);
      if (latestLog && latestLog.metric_value_at_service != null) {
        consumed = Math.max(0, currentReading - latestLog.metric_value_at_service);
      } else {
        consumed = currentReading;
      }
    } else if (rule.metric_type === "time_days") {
      const baseDate = latestLog
        ? new Date(latestLog.service_date)
        : new Date(asset.created_at);
      const diffMs = Math.max(0, now.getTime() - baseDate.getTime());
      consumed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      currentReading = consumed;
    } else if (rule.metric_type === "time_months") {
      const baseDate = latestLog
        ? new Date(latestLog.service_date)
        : new Date(asset.created_at);
      const diffDays = Math.max(
        0,
        (now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      consumed = Math.max(0, diffDays / 30.4375);
      currentReading = Math.round(consumed * 10) / 10;
    } else if (rule.metric_type === "usage_hours") {
      currentReading = Number(payload.usage_hours || 0);
      if (latestLog && latestLog.metric_value_at_service != null) {
        consumed = Math.max(0, currentReading - latestLog.metric_value_at_service);
      } else {
        consumed = currentReading;
      }
    }

    const status = computeStatus(consumed, rule.interval_value);
    const percentage =
      rule.interval_value > 0
        ? Math.min(
            100,
            Math.round((consumed / rule.interval_value) * 1000) / 10
          )
        : 100;
    const remaining = Math.max(
      0,
      Math.round((rule.interval_value - consumed) * 10) / 10
    );

    if (status === "overdue") {
      overall = "overdue";
    } else if (status === "due_soon" && overall !== "overdue") {
      overall = "due_soon";
    }

    items.push({
      rule_id: rule.id,
      maintenance_type: rule.maintenance_type,
      metric_type: rule.metric_type,
      interval_value: rule.interval_value,
      metric_unit: rule.metric_unit,
      current_reading: Math.round(currentReading * 10) / 10,
      last_service_date: lastDate,
      last_service_metric: lastMetric,
      remaining_value: remaining,
      percentage_used: percentage,
      status,
    });
  }

  return {
    asset_id: asset.id,
    asset_name: asset.name,
    overall_status: overall,
    rules_count: rules.length,
    items,
  };
};
