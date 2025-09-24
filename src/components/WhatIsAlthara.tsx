"use client";

import Image from "next/image";
import SectionHeader from "./SectionHeader";
import AnimatedSection, { AnimatedSequence } from "./AnimatedSection";
import { useTranslations } from "next-intl";

export default function WhatIsAlthara() {
  const t = useTranslations("whatIsAlthara");

  return (
    <section id="que-es" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-16" animation="fadeInLeft" delay={0.2}>
          <SectionHeader letter="B" title={t("title")} />
        </AnimatedSection>

        <AnimatedSection className="mb-20" animation="fadeInLeft" delay={0.4}>
          <h2 className="text-4xl font-normal text-althara-black leading-tight mb-6">
            {" "}
            {t("heading")}
          </h2>
          <div
            className="text-lg font-light leading-relaxed max-w-4xl"
            style={{ color: "#666666" }}
          >
            <p>{t("intro.line1")}</p>
            <p>{t("intro.line2")}</p>
          </div>
        </AnimatedSection>

        <AnimatedSequence
          className="space-y-10"
          animation="fadeInLeft"
          baseDelay={0.6}
          delayIncrement={0.2}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div
                  className="text-xs font-medium uppercase tracking-[0.2em]"
                  style={{ color: "#95A1B8" }}
                >
                  {t("differentiators.diff1.title")}
                </div>
                <h3 className="text-4xl font-light text-althara-black leading-tight">
                  {t("differentiators.diff1.heading")
                    .split("\n")
                    .map((line, index) => (
                      <span key={index}>
                        {line}
                        {index === 0 && <br />}
                      </span>
                    ))}
                </h3>
              </div>

              <div className="space-y-6">
                <p
                  className="text-lg font-light leading-relaxed"
                  style={{ color: "#555555" }}
                >
                  {t("differentiators.diff1.description")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative h-80 w-3/5 overflow-hidden">
                <Image
                  src="/png/WhatSection.jpg"
                  alt="Plataforma Exclusiva"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-80 w-2/5 overflow-hidden">
                <Image
                  src="/png/WhatSection1.jpg"
                  alt="Plataforma Exclusiva"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div
                  className="text-xs font-medium uppercase tracking-[0.2em]"
                  style={{ color: "#95A1B8" }}
                >
                  {t("differentiators.diff2.title")}
                </div>
                <h3 className="text-4xl font-light text-althara-black leading-tight">
                  {t("differentiators.diff2.heading")
                    .split("\n")
                    .map((line, index) => (
                      <span key={index}>
                        {line}
                        {index === 0 && <br />}
                      </span>
                    ))}
                </h3>
              </div>

              <div className="space-y-6">
                <p
                  className="text-lg font-light leading-relaxed"
                  style={{ color: "#555555" }}
                >
                  {t("differentiators.diff2.description")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative h-80 w-3/5 overflow-hidden">
                <Image
                  src="/png/WhatSection2.jpg"
                  alt="Algoritmo Avanzado"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-80 w-2/5 overflow-hidden">
                <Image
                  src="/png/WhatSection3.jpg"
                  alt="Algoritmo Avanzado"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div
                  className="text-xs font-medium uppercase tracking-[0.2em]"
                  style={{ color: "#95A1B8" }}
                >
                  {t("differentiators.diff3.title")}
                </div>
                <h3 className="text-4xl font-light text-althara-black leading-tight">
                  {t("differentiators.diff3.heading")
                    .split("\n")
                    .map((line, index) => (
                      <span key={index}>
                        {line}
                        {index === 0 && <br />}
                      </span>
                    ))}
                </h3>
              </div>

              <div className="space-y-6">
                <p
                  className="text-lg font-light leading-relaxed"
                  style={{ color: "#555555" }}
                >
                  {t("differentiators.diff3.description")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative h-80 w-3/5 overflow-hidden">
                <Image
                  src="/png/WhatSection4.jpg"
                  alt="Intermediación Profesional"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-80 w-2/5 overflow-hidden">
                <Image
                  src="/png/WhatSection5.jpg"
                  alt="Intermediación Profesional"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </AnimatedSequence>
      </div>
    </section>
  );
}
