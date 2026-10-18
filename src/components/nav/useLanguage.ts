import { useTranslation } from "react-i18next";
import { loadLanguage } from "@/i18n";

export const LANGUAGES = [
  { code: "fr", label: "Français", flagSrc: "/flags/fr.png", short: "FR" },
  { code: "en", label: "English", flagSrc: "/flags/gb.png", short: "EN" },
];

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const setLanguage = async (code: string) => {
    await loadLanguage(code);
    await i18n.changeLanguage(code);
    try {
      localStorage.setItem("schrift-lang", code);
    } catch {
      // Storage unavailable: the language only applies to this session
    }
  };

  return { current, setLanguage, languages: LANGUAGES };
};
