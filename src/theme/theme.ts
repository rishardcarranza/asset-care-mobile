import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from "react-native-paper";
import { BrandColors } from "./colors";

/**
 * Custom Material Design 3 Light Theme customized with Asset Care branding.
 */
export const customLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: BrandColors.deepTeal,
    onPrimary: BrandColors.white,
    primaryContainer: "#C0E8EC",
    onPrimaryContainer: "#002024",

    secondary: BrandColors.targetRing,
    onSecondary: BrandColors.white,
    secondaryContainer: "#CCE8EC",
    onSecondaryContainer: "#051F23",

    tertiary: BrandColors.accentCyan,
    onTertiary: "#00363D",
    tertiaryContainer: "#A1EBF2",
    onTertiaryContainer: "#002024",

    background: BrandColors.lightBackground,
    onBackground: BrandColors.lightText,
    surface: BrandColors.lightSurface,
    onSurface: BrandColors.lightText,
    surfaceVariant: BrandColors.lightSurfaceVariant,
    onSurfaceVariant: BrandColors.lightTextSecondary,

    outline: BrandColors.lightOutline,
    error: BrandColors.overdueRed,
    errorContainer: BrandColors.overdueContainer,
  },
};

/**
 * Custom Material Design 3 Dark Theme customized with deep teal tones.
 */
export const customDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: BrandColors.accentCyan,
    onPrimary: "#00363D",
    primaryContainer: BrandColors.deepTeal,
    onPrimaryContainer: "#C0E8EC",

    secondary: "#4DD0E1",
    onSecondary: "#00363D",
    secondaryContainer: BrandColors.targetRing,
    onSecondaryContainer: "#CCE8EC",

    tertiary: "#80DEEA",
    onTertiary: "#00363D",
    tertiaryContainer: "#004D56",
    onTertiaryContainer: "#A1EBF2",

    background: BrandColors.darkBackground,
    onBackground: BrandColors.darkText,
    surface: BrandColors.darkSurface,
    onSurface: BrandColors.darkText,
    surfaceVariant: BrandColors.darkSurfaceVariant,
    onSurfaceVariant: BrandColors.darkTextSecondary,

    outline: BrandColors.darkOutline,
    error: "#EF5350",
    errorContainer: "#93000A",
  },
};
