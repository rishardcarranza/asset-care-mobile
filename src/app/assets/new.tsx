import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  Card,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";

import { useAssets } from "../../hooks/useAssets";
import type { AssetType } from "../../types";

export default function NewAssetScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { createAsset } = useAssets();

  // Form State
  const [assetType, setAssetType] = useState<AssetType>("vehicle");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Vehicle & Motorcycle Telemetry
  const [odometer, setOdometer] = useState<string>("");
  const [engine, setEngine] = useState<string>("");
  const [oilType, setOilType] = useState<string>("");

  // Motorcycle specific
  const [displacement, setDisplacement] = useState<string>("");
  const [driveType, setDriveType] = useState<string>("chain");
  const [coolingType, setCoolingType] = useState<string>("air");

  // HVAC specific
  const [btu, setBtu] = useState<string>("");
  const [refrigerant, setRefrigerant] = useState<string>("");

  // Appliance specific
  const [brand, setBrand] = useState<string>("");
  const [modelNumber, setModelNumber] = useState<string>("");

  const [hasError, setHasError] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      setHasError(true);
      return;
    }

    const payload: Record<string, unknown> = {};

    if (assetType === "vehicle" || assetType === "motorcycle") {
      payload.last_odometer = parseFloat(odometer) || 0;
      payload.odometer_unit = "km";
      if (engine.trim()) payload.engine = engine.trim();
      if (oilType.trim()) payload.oil_type = oilType.trim();

      if (assetType === "motorcycle") {
        if (displacement) payload.displacement_cc = parseInt(displacement, 10);
        payload.drive_type = driveType;
        payload.cooling_type = coolingType;
      }
    } else if (assetType === "hvac") {
      if (btu) payload.btu = parseInt(btu, 10);
      if (refrigerant.trim()) payload.refrigerant = refrigerant.trim();
    } else if (assetType === "appliance") {
      if (brand.trim()) payload.brand = brand.trim();
      if (modelNumber.trim()) payload.model_number = modelNumber.trim();
    }

    createAsset({
      name: name.trim(),
      asset_type: assetType,
      description: description.trim() || null,
      metadata_payload: payload,
    });

    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {/* Category Selector */}
      <Text variant="labelLarge" style={{ marginBottom: 8, fontWeight: "600" }}>
        {t("asset_form.category_label")}
      </Text>
      <SegmentedButtons
        value={assetType}
        onValueChange={(val) => setAssetType(val as AssetType)}
        buttons={[
          { value: "vehicle", label: t("categories.vehicle"), icon: "car-side" },
          { value: "motorcycle", label: t("categories.motorcycle"), icon: "motorbike" },
          { value: "hvac", label: t("categories.hvac"), icon: "air-conditioner" },
          { value: "appliance", label: t("categories.appliance"), icon: "washing-machine" },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* General Details */}
      <Card mode="elevated" style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
        <Card.Title title={t("asset_form.general_section")} />
        <Card.Content>
          <TextInput
            label={t("asset_form.name_label")}
            placeholder={t("asset_form.name_placeholder")}
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (hasError) setHasError(false);
            }}
            error={hasError}
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
          {hasError && (
            <HelperText type="error" visible={hasError}>
              {t("asset_form.name_label")} is required
            </HelperText>
          )}

          <TextInput
            label={t("asset_form.description_label")}
            placeholder={t("asset_form.description_placeholder")}
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={{ marginTop: 8 }}
          />
        </Card.Content>
      </Card>

      {/* Dynamic Telemetry & Specs */}
      <Card mode="elevated" style={{ marginBottom: 24, backgroundColor: theme.colors.surface }}>
        <Card.Title title={t("asset_form.telemetry_section")} />
        <Card.Content>
          {(assetType === "vehicle" || assetType === "motorcycle") && (
            <>
              <TextInput
                label={t("asset_form.odometer_label")}
                placeholder="e.g. 45000"
                value={odometer}
                onChangeText={setOdometer}
                keyboardType="numeric"
                mode="outlined"
                right={<TextInput.Affix text="km" />}
                style={{ marginBottom: 12 }}
              />

              {assetType === "motorcycle" && (
                <>
                  <TextInput
                    label={t("asset_form.displacement_label")}
                    placeholder="e.g. 250, 373, 689"
                    value={displacement}
                    onChangeText={setDisplacement}
                    keyboardType="numeric"
                    mode="outlined"
                    right={<TextInput.Affix text="cc" />}
                    style={{ marginBottom: 12 }}
                  />

                  <Text variant="labelMedium" style={{ marginBottom: 4 }}>
                    {t("asset_form.drive_type_label")}
                  </Text>
                  <SegmentedButtons
                    value={driveType}
                    onValueChange={setDriveType}
                    buttons={[
                      { value: "chain", label: t("asset_form.drive_type_chain") },
                      { value: "belt", label: t("asset_form.drive_type_belt") },
                      { value: "shaft", label: t("asset_form.drive_type_shaft") },
                    ]}
                    style={{ marginBottom: 12 }}
                  />

                  <Text variant="labelMedium" style={{ marginBottom: 4 }}>
                    {t("asset_form.cooling_type_label")}
                  </Text>
                  <SegmentedButtons
                    value={coolingType}
                    onValueChange={setCoolingType}
                    buttons={[
                      { value: "air", label: t("asset_form.cooling_type_air") },
                      { value: "liquid", label: t("asset_form.cooling_type_liquid") },
                      { value: "oil", label: t("asset_form.cooling_type_oil") },
                    ]}
                    style={{ marginBottom: 12 }}
                  />
                </>
              )}

              <TextInput
                label={t("asset_form.oil_type_label")}
                placeholder={t("asset_form.oil_type_placeholder")}
                value={oilType}
                onChangeText={setOilType}
                mode="outlined"
                style={{ marginBottom: 12 }}
              />

              <TextInput
                label={t("asset_form.engine_label")}
                placeholder="e.g. Inline-4, G4KE, CP2"
                value={engine}
                onChangeText={setEngine}
                mode="outlined"
              />
            </>
          )}

          {assetType === "hvac" && (
            <>
              <TextInput
                label={t("asset_form.btu_label")}
                placeholder="e.g. 12000, 18000, 24000"
                value={btu}
                onChangeText={setBtu}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginBottom: 12 }}
              />
              <TextInput
                label={t("asset_form.refrigerant_label")}
                placeholder="e.g. R410A, R32"
                value={refrigerant}
                onChangeText={setRefrigerant}
                mode="outlined"
              />
            </>
          )}

          {assetType === "appliance" && (
            <>
              <TextInput
                label={t("asset_form.brand_label")}
                placeholder="e.g. Samsung, LG, Whirlpool"
                value={brand}
                onChangeText={setBrand}
                mode="outlined"
                style={{ marginBottom: 12 }}
              />
              <TextInput
                label={t("asset_form.model_label")}
                placeholder="e.g. WF45T6000AW"
                value={modelNumber}
                onChangeText={setModelNumber}
                mode="outlined"
              />
            </>
          )}
        </Card.Content>
      </Card>

      <Button mode="contained" icon="check" onPress={handleSubmit} style={{ paddingVertical: 4 }}>
        {t("asset_form.create_button")}
      </Button>
    </ScrollView>
  );
}
