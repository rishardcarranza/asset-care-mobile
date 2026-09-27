import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Button,
  Card,
  Chip,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";

import { useAssetDetails } from "../../../hooks/useAssetDetails";

export default function LogServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { asset, rules, recordLog } = useAssetDetails(id);

  const payload = (asset?.metadata_payload || {}) as Record<string, unknown>;
  const currentOdo = payload.last_odometer ? String(payload.last_odometer) : "";

  const [type, setType] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [odometer, setOdometer] = useState<string>(currentOdo);
  const [cost, setCost] = useState<string>("");
  const [performedBy, setPerformedBy] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [hasError, setHasError] = useState<boolean>(false);

  const handleSave = () => {
    if (!type.trim()) {
      setHasError(true);
      return;
    }

    recordLog({
      maintenance_type: type.trim(),
      service_date: new Date(date).toISOString(),
      metric_value_at_service: odometer ? parseFloat(odometer) : null,
      cost: cost ? parseFloat(cost) : null,
      performed_by: performedBy.trim() || null,
      notes: notes.trim() || null,
    });

    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Card mode="elevated" style={{ backgroundColor: theme.colors.surface, marginBottom: 16 }}>
        <Card.Title title={t("log_form.title")} />
        <Card.Content>
          {/* Quick chips from existing rules */}
          {rules.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text variant="labelSmall" style={{ color: theme.colors.outline, marginBottom: 6 }}>
                Select configured service:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {rules.map((r) => (
                  <Chip
                    key={r.id}
                    selected={type === r.maintenance_type}
                    onPress={() => setType(r.maintenance_type)}
                    style={{ marginRight: 6 }}
                  >
                    {r.maintenance_type}
                  </Chip>
                ))}
              </ScrollView>
            </View>
          )}

          <TextInput
            label={t("log_form.type_label")}
            placeholder="e.g. Oil Change, Chain Lube"
            value={type}
            onChangeText={(txt) => {
              setType(txt);
              if (hasError) setHasError(false);
            }}
            error={hasError && !type.trim()}
            mode="outlined"
            style={{ marginBottom: 12 }}
          />
          {hasError && !type.trim() && (
            <HelperText type="error" visible>
              Service type is required.
            </HelperText>
          )}

          <TextInput
            label={t("log_form.service_date_label")}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            mode="outlined"
            style={{ marginBottom: 12 }}
          />

          <TextInput
            label={t("log_form.odometer_at_service")}
            placeholder="e.g. 52000"
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
            mode="outlined"
            style={{ marginBottom: 12 }}
          />

          <TextInput
            label={t("log_form.cost_label")}
            placeholder="0.00"
            value={cost}
            onChangeText={setCost}
            keyboardType="numeric"
            mode="outlined"
            style={{ marginBottom: 12 }}
          />

          <TextInput
            label={t("log_form.performed_by_label")}
            placeholder="e.g. Honda Dealer, Self"
            value={performedBy}
            onChangeText={setPerformedBy}
            mode="outlined"
            style={{ marginBottom: 12 }}
          />

          <TextInput
            label={t("log_form.notes_label")}
            placeholder="Parts replaced, brand of oil, etc."
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={2}
          />
        </Card.Content>
      </Card>

      <Button mode="contained" icon="check" onPress={handleSave}>
        {t("log_form.save_button")}
      </Button>
    </ScrollView>
  );
}
