import { useCallback, useEffect, useState, type ReactNode } from "react";
import { I18nContext, type I18nContextValue } from "./context";
import { translations, type Language, type TranslationKey } from "./translations";

const STORAGE_KEY = "app-lang";

const readLang = (): Language => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "vi" ? stored : "vi";
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(readLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key],
    [lang],
  );

  const value: I18nContextValue = { lang, setLang, t };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
