import React, { useState } from "react";
import { FlatList, RefreshControl, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Badge,
  Card,
  Chip,
  FAB,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAssets, type AssetWithHealth } from "../../hooks/useAssets";
import { useSync } from "../../hooks/useSync";
import type { AssetType } from "../../types";

const getCategoryIcon = (type: AssetType): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (type) {
    case "vehicle":
      return "car-side";
    case "motorcycle":
      return "motorbike";
    case "hvac":
      return "air-conditioner";
    case "appliance":
      return "washing-machine";
    default:
      return "wrench-outline";
  }
};

export default function DashboardScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<AssetType | undefined>(undefined);
  const { items, isLoading, refresh } = useAssets(selectedCategory);
  const { isSyncing, triggerSync } = useSync();

  const handleRefresh = async () => {
    refresh();
    await triggerSync();
  };

  const overdueCount = items.filter((i) => i.health.overall_status === "overdue").length;
  const dueSoonCount = items.filter((i) => i.health.overall_status === "due_soon").length;

  const categories: Array<{ key: AssetType | undefined; label: string; icon: string }> = [
    { key: undefined, label: t("dashboard.filter_all"), icon: "view-grid-outline" },
    { key: "vehicle", label: t("categories.vehicle"), icon: "car-side" },
    { key: "motorcycle", label: t("categories.motorcycle"), icon: "motorbike" },
    { key: "hvac", label: t("categories.hvac"), icon: "air-conditioner" },
    { key: "appliance", label: t("categories.appliance"), icon: "washing-machine" },
  ];

  const renderAssetCard = ({ item }: { item: AssetWithHealth }) => {
    const { asset, health } = item;
    const payload = (asset.metadata_payload || {}) as Record<string, unknown>;

    let statusColor = "#2E7D32";
    let statusText = t("status.ok");
    if (health.overall_status === "overdue") {
      statusColor = "#D32F2F";
      statusText = t("status.overdue");
    } else if (health.overall_status === "due_soon") {
      statusColor = "#F57C00";
      statusText = t("status.due_soon");
    }

    const telemetry =
      payload.last_odometer != null
        ? `${Number(payload.last_odometer).toLocaleString()} ${payload.odometer_unit || "km"}`
        : payload.btu != null
        ? `${payload.btu} BTU`
        : asset.description || "";

    return (
      <Card
        mode="elevated"
        style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: theme.colors.surface }}
        onPress={() => router.push(`/assets/${asset.id}` as any)}
      >
        <Card.Title
          title={asset.name}
          titleVariant="titleMedium"
          titleStyle={{ fontWeight: "700" }}
          subtitle={`${t(`categories.${asset.asset_type}`)} • ${telemetry}`}
          subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
          left={(props) => (
            <Surface
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.primaryContainer,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name={getCategoryIcon(asset.asset_type)}
                size={24}
                color={theme.colors.onPrimaryContainer}
              />
            </Surface>
          )}
          right={(props) => (
            <View style={{ marginRight: 16, alignItems: "flex-end" }}>
              <Badge
                style={{
                  backgroundColor: statusColor,
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  paddingHorizontal: 8,
                }}
              >
                {statusText}
              </Badge>
              <Text variant="labelSmall" style={{ marginTop: 4, color: theme.colors.outline }}>
                {health.rules_count} {t("asset_detail.rules_tab")}
              </Text>
            </View>
          )}
        />
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Top Status Bar */}
      <Surface
        elevation={1}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: theme.colors.surface,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="shield-check-outline" size={20} color={theme.colors.primary} />
          <Text variant="labelMedium" style={{ marginLeft: 6, fontWeight: "600", color: theme.colors.primary }}>
            {t("common.offline_mode")}
          </Text>
        </View>

        <Chip
          icon={isSyncing ? "sync" : "cloud-check-outline"}
          compact
          onPress={triggerSync}
          style={{ backgroundColor: theme.colors.surfaceVariant }}
        >
          {isSyncing ? t("common.syncing") : t("common.sync_now")}
        </Chip>
      </Surface>

      {/* Attention Required Banner */}
      {(overdueCount > 0 || dueSoonCount > 0) && (
        <Surface
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            backgroundColor: overdueCount > 0 ? "#FFEBEE" : "#FFF3E0",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name={overdueCount > 0 ? "alert-circle" : "clock-alert-outline"}
            size={24}
            color={overdueCount > 0 ? "#D32F2F" : "#F57C00"}
          />
          <Text
            variant="bodyMedium"
            style={{
              marginLeft: 10,
              flex: 1,
              fontWeight: "600",
              color: overdueCount > 0 ? "#C62828" : "#E65100",
            }}
          >
            {t("dashboard.attention_needed", { count: overdueCount + dueSoonCount })}
          </Text>
        </Surface>
      )}

      {/* Categories Horizontal Scroll */}
      <View style={{ paddingVertical: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <Chip
                key={cat.key || "all"}
                selected={isSelected}
                icon={cat.icon as any}
                mode={isSelected ? "flat" : "outlined"}
                style={{
                  marginRight: 8,
                  backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
                }}
                onPress={() => setSelectedCategory(cat.key)}
              >
                {cat.label}
              </Chip>
            );
          })}
        </ScrollView>
      </View>

      {/* Assets List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.asset.id}
        renderItem={renderAssetCard}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={isLoading || isSyncing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: "center", justifyContent: "center", padding: 32, marginTop: 40 }}>
              <MaterialCommunityIcons name="package-variant-closed" size={64} color={theme.colors.outline} />
              <Text variant="titleMedium" style={{ marginTop: 16, fontWeight: "bold" }}>
                {t("dashboard.empty_title")}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ textAlign: "center", color: theme.colors.onSurfaceVariant, marginTop: 8 }}
              >
                {t("dashboard.empty_subtitle")}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Floating Action Button to Add New Asset */}
      <FAB
        icon="plus"
        label={t("dashboard.add_first_asset")}
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary,
        }}
        color={theme.colors.onPrimary}
        onPress={() => router.push("/assets/new" as any)}
      />
    </View>
  );
}
