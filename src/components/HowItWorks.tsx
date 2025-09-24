"use client";

import Image from "next/image";
import SectionHeader from "./SectionHeader";
import AnimatedSection, { AnimatedSequence } from "./AnimatedSection";
import { useTranslations } from "next-intl";

export default function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section id="como-funciona" className=" bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-12" animation="fadeInUp" delay={0.2}>
          <SectionHeader letter="A" title={t("title")} />
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start overflow-hidden">
          <AnimatedSection
            className="space-y-8"
            animation="fadeInUp"
            delay={0.4}
          >
            <AnimatedSection animation="fadeInUp" delay={0.5}>
              <h3 className="text-4xl font-normal text-althara-black leading-tight">
                {t("heading")}
              </h3>
            </AnimatedSection>

            <AnimatedSequence
              className="space-y-6"
              animation="fadeInUp"
              baseDelay={0.6}
              delayIncrement={0.2}
            >
              <p
                className="text-lg font-light leading-relaxed"
                style={{ color: "#555555" }}
              >
                {t("description.line1")}
              </p>
              <p
                className="text-lg font-light leading-relaxed"
                style={{ color: "#555555" }}
              >
                {t("description.line2")}
              </p>
              <p
                className="text-lg font-light leading-relaxed"
                style={{ color: "#555555" }}
              >
                {t("description.line3")}
              </p>
            </AnimatedSequence>
          </AnimatedSection>

          <AnimatedSection
            className="space-y-8"
            animation="fadeInUp"
            delay={0.6}
          >
            <AnimatedSequence
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 overflow-hidden"
              animation="fadeInUp"
              baseDelay={0.8}
              delayIncrement={0.2}
            >
              <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
                <Image
                  src="/png/About1.png"
                  alt="Modern Building Facade"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
                <Image
                  src="/png/About.jpg"
                  alt="Professional Meeting"
                  fill
                  className="object-cover"
                />
              </div>
            </AnimatedSequence>

            <AnimatedSequence
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 overflow-hidden"
              animation="fadeInUp"
              baseDelay={1.2}
              delayIncrement={0.2}
            >
              <div className="text-left">
                <div className="text-4xl font-normal text-black mb-2">
                  {t("stats.stat1.number")}
                </div>
                <p className="text-sm text-gray-600 leading-tight">
                  {t("stats.stat1.text")}
                </p>
              </div>
              <div className="text-left">
                <div className="text-4xl font-normal text-black mb-2">
                  {t("stats.stat2.number")}
                </div>
                <p className="text-sm text-gray-600 leading-tight">
                  {t("stats.stat2.text")}
                </p>
              </div>
            </AnimatedSequence>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
