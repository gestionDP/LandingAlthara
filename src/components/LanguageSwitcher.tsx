"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { localeNames, type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  isScrolled?: boolean;
}

export default function LanguageSwitcher({
  isScrolled = false,
}: LanguageSwitcherProps) {
  const { locale, changeLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: Locale) => {
    changeLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className={`h-auto p-2 bg-transparent hover:bg-transparent text-xs font-medium transition-colors ${
          isScrolled
            ? "text-black hover:text-gray-600"
            : "text-white hover:text-gray-300"
        }`}
      >
        <Globe className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white  shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
          {Object.entries(localeNames).map(([code, name]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code as Locale)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                locale === code ? "bg-gray-50 font-medium" : ""
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
