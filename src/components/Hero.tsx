"use client";

import Image from "next/image";
import AnimatedSection from "./AnimatedSection";
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/png/Hero1.png"
          alt="Hero Background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
          <AnimatedSection
            className="mb-3"
            animation="fadeInUp"
            delay={0.2}
            autoAnimate={true}
          >
            <span className="text-white text-sm font-regular tracking-wider">
              {t("tagline")}
            </span>
          </AnimatedSection>

          <AnimatedSection animation="fadeInUp" delay={0.4} autoAnimate={true}>
            <h1 className="text-5xl sm:text-6xl font-normal text-white mb-4 leading-tight">
              {t("title")
                .split("\n")
                .map((line, index) => (
                  <span key={index}>
                    {line}
                    {index === 0 && <br />}
                  </span>
                ))}
            </h1>
          </AnimatedSection>

          <AnimatedSection
            className="space-y-1 mb-6 flex items-start"
            animation="fadeInUp"
            delay={0.6}
            autoAnimate={true}
          >
            <div className="w-px h-16 bg-white mr-4 mt-1"></div>
            <div className="flex-1">
              <p className="text-base text-white font-light">
                {t("description.line1")}
              </p>
              <p className="text-base text-white font-light">
                {t("description.line2")}
              </p>
              <p className="text-base text-white font-light">
                {t("description.line3")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
