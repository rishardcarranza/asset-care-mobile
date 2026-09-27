import React, { useState } from "react";
import { Alert, FlatList, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Divider,
  IconButton,
  List,
  Portal,
  ProgressBar,
  SegmentedButtons,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAssetDetails } from "../../hooks/useAssetDetails";
import { useAssets } from "../../hooks/useAssets";
import type { MaintenanceHealthItem, MaintenanceLog, MaintenanceRule } from "../../types";

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const { asset, rules, logs, health, deleteRule, deleteLog } = useAssetDetails(id);
  const { deleteAsset } = useAssets();

  const [activeTab, setActiveTab] = useState<string>("rules");
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

  if (!asset) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text variant="bodyLarge">{t("common.loading")}</Text>
      </View>
    );
  }

  const handleDeleteAsset = () => {
    deleteAsset(asset.id);
    setDeleteDialogVisible(false);
    router.back();
  };

  const getStatusColor = (status: string) => {
    if (status === "overdue") return "#D32F2F";
    if (status === "due_soon") return "#F57C00";
    return "#2E7D32";
  };

  const renderRuleItem = ({ item }: { item: MaintenanceRule }) => {
    const healthItem = health?.items.find((h) => h.rule_id === item.id);
    const status = healthItem?.status || "ok";
    const statusColor = getStatusColor(status);
    const progress = (healthItem?.percentage_used || 0) / 100;

    return (
      <Card
        mode="outlined"
        style={{
          marginBottom: 12,
          borderColor: status === "overdue" ? "#FFCDD2" : theme.colors.outline,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Card.Title
          title={item.maintenance_type}
          titleVariant="titleMedium"
          titleStyle={{ fontWeight: "bold" }}
          subtitle={`Every ${item.interval_value} ${item.metric_unit}`}
          right={(props) => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Badge style={{ backgroundColor: statusColor, color: "#FFF", marginRight: 8 }}>
                {t(`status.${status}`)}
              </Badge>
              <IconButton icon="delete-outline" size={20} onPress={() => deleteRule(item.id)} />
            </View>
          )}
        />
        <Card.Content>
          <ProgressBar progress={progress} color={statusColor} style={{ height: 8, borderRadius: 4 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {healthItem?.percentage_used || 0}% used
            </Text>
            <Text variant="bodySmall" style={{ fontWeight: "bold", color: statusColor }}>
              {status === "overdue"
                ? t("asset_detail.overdue_by", { val: healthItem?.remaining_value || 0, unit: item.metric_unit })
                : t("asset_detail.remaining", { val: healthItem?.remaining_value || 0, unit: item.metric_unit })}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderLogItem = ({ item }: { item: MaintenanceLog }) => {
    return (
      <Card mode="outlined" style={{ marginBottom: 10, backgroundColor: theme.colors.surface }}>
        <Card.Title
          title={item.maintenance_type}
          subtitle={new Date(item.service_date).toLocaleDateString()}
          right={(props) => (
            <IconButton icon="delete-outline" size={20} onPress={() => deleteLog(item.id)} />
          )}
        />
        <Card.Content>
          {item.metric_value_at_service != null && (
            <Text variant="bodyMedium">
              Reading: {item.metric_value_at_service.toLocaleString()}
            </Text>
          )}
          {item.cost != null && (
            <Text variant="bodyMedium" style={{ fontWeight: "600", color: theme.colors.primary }}>
              Cost: ${Number(item.cost).toFixed(2)}
            </Text>
          )}
          {item.notes && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Notes: {item.notes}
            </Text>
          )}
          {item.performed_by && (
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 2 }}>
              By: {item.performed_by}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Top Banner */}
      <Surface style={{ padding: 16, backgroundColor: theme.colors.surface, elevation: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
              {asset.name}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: "600" }}>
              {t(`categories.${asset.asset_type}`)}
            </Text>
          </View>
          <IconButton icon="delete" iconColor={theme.colors.error} onPress={() => setDeleteDialogVisible(true)} />
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", marginTop: 12 }}>
          <Button
            mode="contained"
            icon="plus"
            style={{ flex: 1, marginRight: 6 }}
            onPress={() => router.push(`/assets/${asset.id}/new-rule` as any)}
          >
            {t("asset_detail.add_rule")}
          </Button>
          <Button
            mode="outlined"
            icon="wrench"
            style={{ flex: 1, marginLeft: 6 }}
            onPress={() => router.push(`/assets/${asset.id}/log-service` as any)}
          >
            {t("asset_detail.log_service")}
          </Button>
        </View>
      </Surface>

      {/* Segmented Tabs */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: "rules", label: t("asset_detail.rules_tab"), icon: "timer-cog-outline" },
            { value: "history", label: t("asset_detail.history_tab"), icon: "history" },
            { value: "specs", label: t("asset_detail.specs_tab"), icon: "information-outline" },
          ]}
        />
      </View>

      {/* Tab Content */}
      {activeTab === "rules" && (
        <FlatList
          data={rules}
          keyExtractor={(r) => r.id}
          renderItem={renderRuleItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 32 }}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={theme.colors.outline} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                {t("asset_detail.no_rules")}
              </Text>
            </View>
          }
        />
      )}

      {activeTab === "history" && (
        <FlatList
          data={logs}
          keyExtractor={(l) => l.id}
          renderItem={renderLogItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 32 }}>
              <MaterialCommunityIcons name="history" size={48} color={theme.colors.outline} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                {t("asset_detail.empty_history")}
              </Text>
            </View>
          }
        />
      )}

      {activeTab === "specs" && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}>
          <Card mode="outlined" style={{ backgroundColor: theme.colors.surface }}>
            <Card.Content>
              {Object.entries((asset.metadata_payload || {}) as Record<string, unknown>).map(([key, val]) => (
                <View key={key} style={{ paddingVertical: 6 }}>
                  <Text variant="labelSmall" style={{ color: theme.colors.outline, textTransform: "uppercase" }}>
                    {key.replace("_", " ")}
                  </Text>
                  <Text variant="bodyLarge" style={{ fontWeight: "500" }}>
                    {val != null ? String(val) : "—"}
                  </Text>
                  <Divider style={{ marginTop: 6 }} />
                </View>
              ))}
            </Card.Content>
          </Card>
        </ScrollView>
      )}

      {/* Delete Confirmation Portal */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>{t("asset_detail.delete_confirm_title")}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t("asset_detail.delete_confirm_msg")}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>{t("common.cancel")}</Button>
            <Button textColor={theme.colors.error} onPress={handleDeleteAsset}>
              {t("common.delete")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
