"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import { localeNames, type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  isScrolled?: boolean;
}

export default function LanguageSwitcher({
  isScrolled = false,
}: LanguageSwitcherProps) {
  const { locale, changeLocale } = useLocale();

  const handleLanguageChange = (newLocale: Locale) => {
    changeLocale(newLocale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] mt-2">
        {Object.entries(localeNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as Locale)}
            className={`cursor-pointer font-medium flex items-center justify-between ${
              locale === code
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            <span>{name}</span>
            {locale === code && <Check className="h-4 w-4 text-gray-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
