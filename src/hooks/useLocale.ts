"use client";

import { useState, useEffect } from "react";

export type Locale = "es" | "en";

export function useLocale() {
  const [locale, setLocale] = useState<Locale>("es");

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale && (savedLocale === "es" || savedLocale === "en")) {
      setLocale(savedLocale);
    } else {
      const browserLang = navigator.language.split("-")[0];
      setLocale(browserLang === "en" ? "en" : "es");
    }
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

  return { locale, changeLocale };
}
