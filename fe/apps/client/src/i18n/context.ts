import { createContext } from "react";
import type { Language, TranslationKey } from "./translations";

export type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
