"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
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
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");
  const { getToken, isSignedIn } = useAuth();

  // Load language from Supabase on sign-in, fallback to localStorage
  useEffect(() => {
    if (!isSignedIn) {
      const saved = localStorage.getItem("eduswarm_language") as LangCode | null;
      if (saved && TRANSLATIONS[saved]) setLangState(saved);
      return;
    }

    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/v1/preferences/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const savedLang = data.language as LangCode;
          if (savedLang && TRANSLATIONS[savedLang]) {
            setLangState(savedLang);
            localStorage.setItem("eduswarm_language", savedLang);
          }
        }
      } catch {
        // Fallback to localStorage
        const saved = localStorage.getItem("eduswarm_language") as LangCode | null;
        if (saved && TRANSLATIONS[saved]) setLangState(saved);
      }
    })();
  }, [isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply dir + lang attributes to <html> whenever lang changes
  useEffect(() => {
    const dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback(async (code: LangCode) => {
    setLangState(code);
    localStorage.setItem("eduswarm_language", code);

    // Persist to Supabase if signed in
    if (isSignedIn) {
      try {
        const token = await getToken();
        await fetch(`${API_BASE}/api/v1/preferences/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ language: code }),
        });
      } catch {
        // Silent fail — localStorage is already updated
      }
    }

    // Notify other tabs
    window.dispatchEvent(
      new StorageEvent("storage", { key: "eduswarm_language", newValue: code })
    );
  }, [isSignedIn, getToken]); // eslint-disable-line react-hooks/exhaustive-deps

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
