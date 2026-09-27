import React from "react";
import { ScrollView, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  List,
  RadioButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { changeAppLanguage } from "../../i18n";
import { useSync } from "../../hooks/useSync";
import { getApiBaseUrl } from "../../api/client";

export default function SettingsScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { isSyncing, lastSyncedAt, syncError, triggerSync } = useSync();

  const currentLang = i18n.language.startsWith("es") ? "es" : "en";

  const handleLanguageChange = (lang: string) => {
    changeAppLanguage(lang as "en" | "es");
  };

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString()
    : t("common.never_synced");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Brand Header */}
      <Surface
        style={{
          padding: 20,
          borderRadius: 16,
          backgroundColor: theme.colors.surface,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Surface
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <MaterialCommunityIcons name="shield-check" size={36} color={theme.colors.onPrimary} />
        </Surface>
        <Text variant="headlineSmall" style={{ fontWeight: "bold", color: theme.colors.primary }}>
          {t("app_name")}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          {t("settings.version")}
        </Text>
      </Surface>

      {/* Language Section */}
      <Card mode="elevated" style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
        <Card.Title
          title={t("settings.language_section")}
          left={(props) => <List.Icon {...props} icon="translate" />}
        />
        <Card.Content>
          <RadioButton.Group onValueChange={handleLanguageChange} value={currentLang}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}>
              <RadioButton value="en" />
              <Text variant="bodyLarge" style={{ marginLeft: 8 }}>
                {t("settings.lang_en")} (English)
              </Text>
            </View>
            <Divider style={{ marginVertical: 6 }} />
            <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}>
              <RadioButton value="es" />
              <Text variant="bodyLarge" style={{ marginLeft: 8 }}>
                {t("settings.lang_es")} (Español)
              </Text>
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Synchronization Section */}
      <Card mode="elevated" style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
        <Card.Title
          title={t("settings.sync_section")}
          left={(props) => <List.Icon {...props} icon="cloud-sync-outline" />}
        />
        <Card.Content>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
            {t("settings.sync_description")}
          </Text>

          <View style={{ marginBottom: 12 }}>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              {t("common.last_synced", { time: formattedSyncTime })}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
              API: {getApiBaseUrl()}
            </Text>
            {syncError && (
              <Text variant="labelSmall" style={{ color: theme.colors.error, marginTop: 4 }}>
                {syncError}
              </Text>
            )}
          </View>

          <Button
            mode="contained"
            icon="sync"
            loading={isSyncing}
            disabled={isSyncing}
            onPress={triggerSync}
          >
            {isSyncing ? t("common.syncing") : t("common.sync_now")}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
