"use client";

import { NextIntlClientProvider } from "next-intl";
import { useState, useEffect } from "react";

interface MessagesProviderProps {
  children: React.ReactNode;
}

export default function MessagesProvider({ children }: MessagesProviderProps) {
  const [messages, setMessages] = useState<Record<string, unknown> | null>(
    null
  );
  const [locale, setLocale] = useState<"es" | "en">("es");

  const detectLocale = () => {
    const stored = localStorage.getItem("locale") as "es" | "en" | null;
    if (stored === "es" || stored === "en") return stored;

    const cookieMatch = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("locale="));
    if (cookieMatch) {
      const cookieVal = cookieMatch.split("=")[1] as "es" | "en";
      if (cookieVal === "es" || cookieVal === "en") return cookieVal;
    }

    const browserLang = navigator.language.split("-")[0];
    return browserLang === "en" ? "en" : "es";
  };

  useEffect(() => {
    const initialLocale = detectLocale();
    setLocale(initialLocale);

    const loadMessages = async (lang: "es" | "en") => {
      try {
        const messagesModule = await import(`../messages/${lang}.json`);
        setMessages(messagesModule.default);
      } catch (error) {
        console.error("Error loading messages:", error);
        const fallbackMessages = await import(`../messages/es.json`);
        setMessages(fallbackMessages.default);
      }
    };

    loadMessages(initialLocale);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLocale = localStorage.getItem("locale") as "es" | "en";
      if (newLocale && newLocale !== locale) {
        setLocale(newLocale);
        import(`../messages/${newLocale}.json`).then((module) => {
          setMessages(module.default);
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [locale]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  if (!messages) {
    return null;
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
