"use client";

import Image from "next/image";
import SectionHeader from "./SectionHeader";
import AnimatedSection, { AnimatedSequence } from "./AnimatedSection";
import { useTranslations } from "next-intl";

export default function WhatIsAlthara() {
  const t = useTranslations("whatIsAlthara");

  return (
    <section id="que-es" className=" bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-12" animation="fadeInLeft" delay={0.2}>
          <SectionHeader letter="B" title={t("title")} />
        </AnimatedSection>

        <AnimatedSection className="mb-16" animation="fadeInLeft" delay={0.4}>
          <h2 className="text-4xl font-normal text-althara-black leading-tight mb-6">
            {t("heading")}
          </h2>
          <div
            className="text-base font-normal leading-relaxed max-w-4xl"
            style={{ color: "#555555" }}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="space-y-4">
              <div
                className="text-sm font-medium uppercase tracking-wider"
                style={{ color: "#95A1B8" }}
              >
                {t("differentiators.diff1.title")}
              </div>
              <h3 className="text-2xl font-medium text-althara-black leading-tight">
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

            <div className="relative h-48 overflow-hidden">
              <Image
                src="/png/Area.png"
                alt="Modern Building Facade"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-4">
              <p
                className="text-base font-normal leading-relaxed"
                style={{ color: "#555555" }}
              >
                {t("differentiators.diff1.description")}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-300 mt-8"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="space-y-4">
              <div
                className="text-sm font-medium uppercase tracking-wider"
                style={{ color: "#95A1B8" }}
              >
                {t("differentiators.diff2.title")}
              </div>
              <h3 className="text-2xl font-medium text-althara-black leading-tight">
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

            <div className="relative h-48 overflow-hidden">
              <Image
                src="/png/Area1.png"
                alt="Professional Meeting"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-4">
              <p
                className="text-base font-normal leading-relaxed"
                style={{ color: "#555555" }}
              >
                {t("differentiators.diff2.description")}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-300 mt-8"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="space-y-4">
              <div
                className="text-sm font-medium uppercase tracking-wider"
                style={{ color: "#95A1B8" }}
              >
                {t("differentiators.diff3.title")}
              </div>
              <h3 className="text-2xl font-medium text-althara-black leading-tight">
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

            <div className="relative h-48 overflow-hidden">
              <Image
                src="/png/Area2.png"
                alt="Modern Building Facade"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-4">
              <p
                className="text-base font-normal leading-relaxed"
                style={{ color: "#555555" }}
              >
                {t("differentiators.diff3.description")}
              </p>
            </div>
          </div>
        </AnimatedSequence>
      </div>
    </section>
  );
}
