"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-althara-dark-blue text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="mb-6">
              <Image
                src="/svg/logoFull.svg"
                alt="Althara Logo"
                width={200}
                height={50}
                className=" brightness-0 invert"
              />
            </div>
            <p className="text-white text-sm leading-relaxed max-w-md">
              {t("description")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {t("quickLinks.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#como-funciona"
                  className="text-white hover:text-black text-sm transition-colors"
                >
                  {t("quickLinks.howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href="#que-es"
                  className="text-white hover:text-black text-sm transition-colors"
                >
                  {t("quickLinks.whatIs")}
                </Link>
              </li>
              <li>
                <Link
                  href="#nuestro-proceso"
                  className="text-white hover:text-black text-sm transition-colors"
                >
                  {t("quickLinks.process")}
                </Link>
              </li>
              <li>
                <Link
                  href="#para-quien-es"
                  className="text-white hover:text-black text-sm transition-colors"
                >
                  {t("quickLinks.whoIsItFor")}
                </Link>
              </li>
              <li>
                <Link
                  href="#casos-de-exito"
                  className="text-white hover:text-black text-sm transition-colors"
                >
                  {t("quickLinks.successCases")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {t("contact.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="mailto:info@althara.com"
                  className="text-white hover:text-black text-sm transition-colors"
                >
                  {t("contact.email")}
                </Link>
              </li>
              <li>
                <Link
                  href="tel:+34600000000"
                  className="text-white hover:text-black text-sm transition-colors"
                >
                  {t("contact.phone")}
                </Link>
              </li>
              <li className="text-white text-sm">{t("contact.location")}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white text-sm mb-4 md:mb-0">
              {t("copyright")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
