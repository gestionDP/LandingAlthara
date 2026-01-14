import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { locales, defaultLocale } from "./i18n/config";

function normalizeLocale(raw?: string | null) {
  if (!raw) return defaultLocale;
  const lang = raw.split("-")[0] as (typeof locales)[number];
  return locales.includes(lang) ? lang : defaultLocale;
}

export default getRequestConfig(async () => {
  const headerStore = headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const cookieLocale = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("locale="))
    ?.split("=")[1];
  const headerLocale = headerStore.get("accept-language");
  const locale = normalizeLocale(cookieLocale ?? headerLocale);

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
