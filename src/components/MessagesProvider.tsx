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

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as "es" | "en";
    if (savedLocale && (savedLocale === "es" || savedLocale === "en")) {
      setLocale(savedLocale);
    }

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

    loadMessages(savedLocale || "es");
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

  if (!messages) {
    return <div>Loading...</div>;
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
