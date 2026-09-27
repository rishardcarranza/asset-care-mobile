import { useEffect, useState } from "react";
import { useColorScheme, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, PaperProvider } from "react-native-paper";

import "../i18n";
import { initLocalDatabase } from "../database/db";
import { customDarkTheme, customLightTheme } from "../theme/theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? customDarkTheme : customLightTheme;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      initLocalDatabase();
    } catch (e) {
      console.error("[RootLayout] Database initialization failed:", e);
    } finally {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <PaperProvider theme={theme}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.background,
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.onPrimary,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="assets/new"
          options={{ presentation: "modal", headerTitle: "Asset Care" }}
        />
        <Stack.Screen
          name="assets/[id]"
          options={{ headerTitle: "Asset Care" }}
        />
        <Stack.Screen
          name="assets/[id]/new-rule"
          options={{ presentation: "modal", headerTitle: "Asset Care" }}
        />
        <Stack.Screen
          name="assets/[id]/log-service"
          options={{ presentation: "modal", headerTitle: "Asset Care" }}
        />
      </Stack>
    </PaperProvider>
  );
}
