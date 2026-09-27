import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import es from "../locales/es.json";

export const defaultNS = "translation";
export const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

// Detect device language code (e.g. "es-US" -> "es", "en-GB" -> "en")
const deviceLocales = Localization.getLocales();
const deviceLanguage = deviceLocales[0]?.languageCode ?? "en";
const initialLanguage = deviceLanguage.startsWith("es") ? "es" : "en";

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

/**
 * Switch the application language at runtime.
 */
export const changeAppLanguage = async (language: "en" | "es"): Promise<void> => {
  await i18n.changeLanguage(language);
};

export default i18n;
