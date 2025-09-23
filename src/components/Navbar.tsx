"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ContactModal from "./ContactModal";
import { Button } from "@/components/ui/button";
import { useScrollEffect } from "@/hooks/useScrollEffect";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrollEffect(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations("navbar");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen) {
        const target = event.target as Element;
        if (!target.closest("nav")) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          <div className="hidden xl:flex justify-start">
            <div className="flex items-center space-x-4">
              <Link
                href="#como-funciona"
                className={`text-xs font-medium transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-black hover:text-gray-600"
                    : "text-white hover:text-gray-300"
                }`}
              >
                {t("menu.howItWorks")}
              </Link>
              <Link
                href="#que-es"
                className={`text-xs font-medium transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-black hover:text-gray-600"
                    : "text-white hover:text-gray-300"
                }`}
              >
                {t("menu.whatIs")}
              </Link>
              <Link
                href="#nuestro-proceso"
                className={`text-xs font-medium transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-black hover:text-gray-600"
                    : "text-white hover:text-gray-300"
                }`}
              >
                {t("menu.process")}
              </Link>
              <Link
                href="#para-quien-es"
                className={`text-xs font-medium transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-black hover:text-gray-600"
                    : "text-white hover:text-gray-300"
                }`}
              >
                {t("menu.whoIsItFor")}
              </Link>
              <Link
                href="#por-que-confiar"
                className={`text-xs font-medium transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-black hover:text-gray-600"
                    : "text-white hover:text-gray-300"
                }`}
              >
                {t("menu.whyTrust")}
              </Link>
            </div>
          </div>

          <div className="flex justify-start xl:justify-center">
            <Image
              src="/svg/logoFull.svg"
              alt="Althara Logo"
              width={200}
              height={50}
              className={`h-10 w-auto transition-all duration-300 ${
                isScrolled ? "brightness-0" : "brightness-0 invert"
              }`}
            />
          </div>

          <div className="hidden xl:flex justify-end items-center space-x-4">
            <LanguageSwitcher isScrolled={isScrolled} />
            <Button
              onClick={openModal}
              variant="ghost"
              className={`h-auto p-2 bg-transparent hover:bg-transparent text-xs font-medium transition-colors ${
                isScrolled
                  ? "text-black hover:text-gray-600"
                  : "text-white hover:text-gray-300"
              }`}
            >
              {t("contactUs")}
            </Button>
          </div>

          <div className="xl:hidden col-start-3 flex justify-end">
            <Button
              onClick={toggleMenu}
              variant="ghost"
              size="icon"
              className={`h-10 w-10 bg-transparent hover:bg-gray-100 focus:outline-none transition-colors border border-gray-200 hover:border-gray-300 ${
                isScrolled
                  ? "text-black hover:text-gray-600"
                  : "text-black hover:text-gray-600"
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 right-0 z-[60] bg-white/95 backdrop-blur-sm shadow-lg border-t border-gray-200">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link
                href="#como-funciona"
                className="text-gray-800 hover:text-althara-primary block px-3 py-3 text-sm font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("menu.howItWorks")}
              </Link>
              <Link
                href="#que-es"
                className="text-gray-800 hover:text-althara-primary block px-3 py-3 text-sm font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("menu.whatIs")}
              </Link>
              <Link
                href="#nuestro-proceso"
                className="text-gray-800 hover:text-althara-primary block px-3 py-3 text-sm font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("menu.process")}
              </Link>
              <Link
                href="#para-quien-es"
                className="text-gray-800 hover:text-althara-primary block px-3 py-3 text-sm font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("menu.whoIsItFor")}
              </Link>
              <Link
                href="#por-que-confiar"
                className="text-gray-800 hover:text-althara-primary block px-3 py-3 text-sm font-medium transition-colors border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("menu.whyTrust")}
              </Link>
              <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
                <LanguageSwitcher isScrolled={true} />
              </div>
              <Button
                onClick={() => {
                  openModal();
                  setIsMenuOpen(false);
                }}
                className="w-full mt-4"
              >
                {t("contactUs")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </nav>
  );
}
