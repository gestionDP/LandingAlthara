"use client";

import Image from "next/image";
import SectionHeader from "./SectionHeader";
import AnimatedSection, { AnimatedSequence } from "./AnimatedSection";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function WhoIsItFor() {
  const t = useTranslations("whoIsItFor");

  return (
    <section id="para-quien-es" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-12" animation="fadeInUp" delay={0.2}>
          <SectionHeader letter="D" title={t("title")} />
        </AnimatedSection>

        <AnimatedSection className="mb-16" animation="fadeInUp" delay={0.4}>
          <h2 className="text-4xl font-normal text-althara-black leading-tight mb-6">
            {t("heading")}
          </h2>
          <p
            className="text-lg font-light leading-relaxed max-w-4xl"
            style={{ color: "#555555" }}
          >
            {t("description")}
          </p>
        </AnimatedSection>

        <AnimatedSequence
          className="space-y-10 overflow-hidden"
          animation="fadeInUp"
          baseDelay={0.6}
          delayIncrement={0.2}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <motion.div
              className="lg:col-span-4 rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.02,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.h3 className="text-2xl font-medium text-althara-black leading-tight transition-colors duration-500">
                {t("profiles.investors.title")}
              </motion.h3>
            </motion.div>

            <motion.div
              className="lg:col-span-4 rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.02,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.p
                className="text-lg font-light leading-relaxed transition-colors duration-500"
                style={{ color: "#555555" }}
              >
                {t("profiles.investors.description")}
              </motion.p>
            </motion.div>

            <motion.div
              className="lg:col-span-4 flex justify-center lg:justify-end rounded-lg transition-all duration-500 cursor-pointer overflow-hidden"
              whileHover={{
                scale: 1.05,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 lg:h-32 lg:w-32 overflow-hidden">
                <Image
                  src="/png/Service.png"
                  alt="Elegant Interior Space"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
          <div className="h-px bg-gray-300"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <motion.div
              className="lg:col-span-4 rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.02,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.h3 className="text-2xl font-medium text-althara-black leading-tight transition-colors duration-500">
                {t("profiles.owners.title")}
              </motion.h3>
            </motion.div>

            <motion.div
              className="lg:col-span-4 rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.02,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.p
                className="text-lg font-light leading-relaxed transition-colors duration-500"
                style={{ color: "#555555" }}
              >
                {t("profiles.owners.description")}
              </motion.p>
            </motion.div>

            <motion.div
              className="lg:col-span-4 flex justify-center lg:justify-end rounded-lg transition-all duration-500 cursor-pointer overflow-hidden"
              whileHover={{
                scale: 1.05,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 lg:h-32 lg:w-32 overflow-hidden">
                <Image
                  src="/png/Service1.png"
                  alt="Warm Interior Space"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>

          <div className="h-px bg-gray-300"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <motion.div
              className="lg:col-span-4 rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.02,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.h3 className="text-2xl font-medium text-althara-black leading-tight transition-colors duration-500">
                {t("profiles.advisors.title")}
              </motion.h3>
            </motion.div>

            <motion.div
              className="lg:col-span-4 rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.02,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.p
                className="text-lg font-light leading-relaxed transition-colors duration-500"
                style={{ color: "#555555" }}
              >
                {t("profiles.advisors.description")}
              </motion.p>
            </motion.div>

            <motion.div
              className="lg:col-span-4 flex justify-center lg:justify-end rounded-lg transition-all duration-500 cursor-pointer overflow-hidden"
              whileHover={{
                scale: 1.05,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 lg:h-32 lg:w-32 overflow-hidden">
                <Image
                  src="/png/Service2.png"
                  alt="Modern Architectural Facade"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </AnimatedSequence>
      </div>
    </section>
  );
}
