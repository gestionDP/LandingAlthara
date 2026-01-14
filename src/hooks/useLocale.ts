"use client";

import { useState, useEffect } from "react";

export type Locale = "es" | "en";

export function useLocale() {
  const [locale, setLocale] = useState<Locale>("es");

  const detectLocale = (): Locale => {
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    if (savedLocale === "es" || savedLocale === "en") return savedLocale;

    const cookieLocale = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("locale="))
      ?.split("=")[1] as Locale | undefined;
    if (cookieLocale === "es" || cookieLocale === "en") return cookieLocale;

    const browserLang = navigator.language.split("-")[0];
    return browserLang === "en" ? "en" : "es";
  };

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);

    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;

    window.dispatchEvent(
      new CustomEvent("localeChanged", { detail: newLocale })
    );

    window.location.reload();
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return { locale, changeLocale };
}
