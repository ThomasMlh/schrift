import i18n, { type Resource } from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";

// French is the default and fallback language and ships with the app; other languages are loaded
// on demand so French visitors do not download them.
const loaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import("./locales/en.json"),
};

const readSavedLanguage = () => {
  try {
    return localStorage.getItem("schrift-lang") || "fr";
  } catch {
    return "fr";
  }
};

export const loadLanguage = async (code: string) => {
  if (i18n.hasResourceBundle(code, "translation")) return;
  const module = await loaders[code]?.();
  if (module) i18n.addResourceBundle(code, "translation", module.default);
};

const savedLanguage = readSavedLanguage();
const resources: Resource = { fr: { translation: fr } };

// Resolved once the saved language is available: the app renders after it, without a French flash
export const i18nReady = (loaders[savedLanguage]?.() ?? Promise.resolve(null))
  .then((module) => {
    if (module) resources[savedLanguage] = { translation: module.default };
  })
  .catch(() => undefined)
  .then(() => i18n.use(initReactI18next).init({
    resources,
    lng: resources[savedLanguage] ? savedLanguage : "fr",
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false
    }
  }));

export default i18n;
