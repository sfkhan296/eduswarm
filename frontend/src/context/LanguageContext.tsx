"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { LangCode, UIStrings } from "@/lib/i18n";
import { TRANSLATIONS, t as translate } from "@/lib/i18n";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: (key: keyof UIStrings) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => translate("en", key),
  dir: "ltr",
});

const RTL_LANGS: LangCode[] = ["ar"];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("eduswarm_language") as LangCode | null;
    if (saved && TRANSLATIONS[saved]) setLangState(saved);
  }, []);

  // Apply dir + lang attributes to <html> whenever lang changes
  useEffect(() => {
    const dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    localStorage.setItem("eduswarm_language", code);
    // Notify other tabs
    window.dispatchEvent(
      new StorageEvent("storage", { key: "eduswarm_language", newValue: code })
    );
  }, []);

  const t = useCallback(
    (key: keyof UIStrings) => translate(lang, key),
    [lang]
  );

  const dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
