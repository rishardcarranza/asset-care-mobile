import React, { useState } from "react";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { SyncMetaDao } from "../database/syncMetaDao";
import { getApiBaseUrl } from "../api/client";

interface ApiConfigDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (newUrl: string) => void;
}

export const ApiConfigDialog: React.FC<ApiConfigDialogProps> = ({
  visible,
  onDismiss,
  onSave,
}) => {
  const { t } = useTranslation();
  const [tempUrl, setTempUrl] = useState<string>(getApiBaseUrl());

  const handleReset = () => {
    SyncMetaDao.setCustomApiUrl(null);
    const defaultUrl = getApiBaseUrl();
    setTempUrl(defaultUrl);
    onSave(defaultUrl);
    onDismiss();
  };

  const handleSave = () => {
    SyncMetaDao.setCustomApiUrl(tempUrl);
    const updatedUrl = getApiBaseUrl();
    onSave(updatedUrl);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t("settings.edit_api_url")}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label={t("settings.api_url_label")}
            value={tempUrl}
            onChangeText={setTempUrl}
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleReset}>{t("settings.reset_api_url")}</Button>
          <Button mode="contained" onPress={handleSave}>
            {t("common.save")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
