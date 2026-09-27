import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Button,
  Card,
  HelperText,
  SegmentedButtons,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";

import { useAssetDetails } from "../../../hooks/useAssetDetails";
import type { MetricType } from "../../../types";

export default function NewRuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { addRule } = useAssetDetails(id);

  const [type, setType] = useState<string>("");
  const [metricType, setMetricType] = useState<MetricType>("odometer");
  const [interval, setInterval] = useState<string>("");
  const [unit, setUnit] = useState<string>("km");
  const [description, setDescription] = useState<string>("");

  const [hasError, setHasError] = useState<boolean>(false);

  const handleMetricTypeChange = (newMetric: string) => {
    const m = newMetric as MetricType;
    setMetricType(m);
    if (m === "odometer") setUnit("km");
    else if (m === "time_days") setUnit("days");
    else if (m === "time_months") setUnit("months");
    else if (m === "usage_hours") setUnit("hrs");
  };

  const handleSave = () => {
    const num = parseFloat(interval);
    if (!type.trim() || isNaN(num) || num <= 0) {
      setHasError(true);
      return;
    }

    addRule({
      maintenance_type: type.trim(),
      metric_type: metricType,
      interval_value: num,
      metric_unit: unit.trim(),
      description: description.trim() || null,
    });

    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Card mode="elevated" style={{ backgroundColor: theme.colors.surface, marginBottom: 16 }}>
        <Card.Title title={t("rule_form.title")} />
        <Card.Content>
          <TextInput
            label={t("rule_form.type_label")}
            placeholder={t("rule_form.type_placeholder")}
            value={type}
            onChangeText={(txt) => {
              setType(txt);
              if (hasError) setHasError(false);
            }}
            error={hasError && !type.trim()}
            mode="outlined"
            style={{ marginBottom: 12 }}
          />

          <SegmentedButtons
            value={metricType}
            onValueChange={handleMetricTypeChange}
            buttons={[
              { value: "odometer", label: t("metrics.odometer"), icon: "speedometer" },
              { value: "time_months", label: t("metrics.time_months"), icon: "calendar-month" },
              { value: "time_days", label: t("metrics.time_days"), icon: "calendar-today" },
            ]}
            style={{ marginBottom: 12 }}
          />

          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <TextInput
              label={t("rule_form.interval_label")}
              placeholder={t("rule_form.interval_placeholder")}
              value={interval}
              onChangeText={(txt) => {
                setInterval(txt);
                if (hasError) setHasError(false);
              }}
              error={hasError && (!interval || isNaN(Number(interval)))}
              keyboardType="numeric"
              mode="outlined"
              style={{ flex: 2, marginRight: 8 }}
            />
            <TextInput
              label={t("rule_form.unit_label")}
              value={unit}
              onChangeText={setUnit}
              mode="outlined"
              style={{ flex: 1 }}
            />
          </View>
          {hasError && (
            <HelperText type="error" visible={hasError}>
              Please enter a valid maintenance type and positive interval value.
            </HelperText>
          )}

          <TextInput
            label={t("rule_form.notes_label")}
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={2}
          />
        </Card.Content>
      </Card>

      <Button mode="contained" icon="check" onPress={handleSave}>
        {t("rule_form.save_button")}
      </Button>
    </ScrollView>
  );
}
