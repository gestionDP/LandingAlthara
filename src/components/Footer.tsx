"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-[#0a0a0a] text-[#e6e2d7] py-10">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
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
            <p className="text-[#e6e2d7] text-lg font-light leading-relaxed max-w-md italic">
              {t("mantra")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#e6e2d7] mb-4 uppercase tracking-wider">
              {t("quickLinks.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#sistema"
                  className="text-[#e6e2d7] hover:text-[#e6e2d7]/80 text-sm transition-colors"
                >
                  {t("quickLinks.system")}
                </Link>
              </li>
              <li>
                <Link
                  href="#proceso"
                  className="text-[#e6e2d7] hover:text-[#e6e2d7]/80 text-sm transition-colors"
                >
                  {t("quickLinks.process")}
                </Link>
              </li>
              <li>
                <Link
                  href="#acceso"
                  className="text-[#e6e2d7] hover:text-[#e6e2d7]/80 text-sm transition-colors"
                >
                  {t("quickLinks.access")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#e6e2d7] mb-4 uppercase tracking-wider">
              {t("contact.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="mailto:info@althara.com"
                  className="text-[#e6e2d7] hover:text-[#e6e2d7]/80 text-sm transition-colors"
                >
                  {t("contact.email")}
                </Link>
              </li>
              <li>
                <Link
                  href="tel:+34600000000"
                  className="text-[#e6e2d7] hover:text-[#e6e2d7]/80 text-sm transition-colors"
                >
                  {t("contact.phone")}
                </Link>
              </li>
              <li className="text-[#e6e2d7] text-sm">{t("contact.location")}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e6e2d7]/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-[#e6e2d7] text-sm mb-4 md:mb-0">
              {t("copyright")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
