"use client";

import Image from "next/image";
import SectionHeader from "./SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedSection, { AnimatedSequence } from "./AnimatedSection";
import { useTranslations } from "next-intl";

export default function SuccessCases() {
  const t = useTranslations("successCases");

  const cases = [
    {
      id: 1,
      assetType: t("cases.case1.assetType"),
      initialInvestment: t("cases.case1.initialInvestment"),
      time: t("cases.case1.time"),
      exitPrice: t("cases.case1.exitPrice"),
      roi: t("cases.case1.roi"),
      operationType: t("cases.case1.operationType"),
      projectName: t("cases.case1.projectName"),
      description: t("cases.case1.description"),
      mapImage: "/png/Success.png",
    },
    {
      id: 2,
      assetType: t("cases.case2.assetType"),
      initialInvestment: t("cases.case2.initialInvestment"),
      time: t("cases.case2.time"),
      exitPrice: t("cases.case2.exitPrice"),
      roi: t("cases.case2.roi"),
      operationType: t("cases.case2.operationType"),
      projectName: t("cases.case2.projectName"),
      description: t("cases.case2.description"),
      mapImage: "/png/Success1.png",
    },
    {
      id: 3,
      assetType: t("cases.case3.assetType"),
      initialInvestment: t("cases.case3.initialInvestment"),
      time: t("cases.case3.time"),
      exitPrice: t("cases.case3.exitPrice"),
      roi: t("cases.case3.roi"),
      operationType: t("cases.case3.operationType"),
      projectName: t("cases.case3.projectName"),
      description: t("cases.case3.description"),
      mapImage: "/png/Success2.png",
    },
  ];

  return (
    <section className="bg-white pb-20">
      <div
        id="casos-de-exito"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <AnimatedSection className="mb-16" animation="fadeInUp" delay={0.2}>
          <SectionHeader letter="C" title={t("title")} variant="light" />
        </AnimatedSection>

        <AnimatedSequence
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          animation="fadeInUp"
          baseDelay={0.4}
          delayIncrement={0.2}
        >
          {cases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className="group overflow-hidden hover:scale-105 transition-transform duration-300 ease-out cursor-pointer h-full flex flex-col border-0 shadow-none rounded-none"
            >
              <CardContent className="p-0 flex flex-col h-full">
                <div className="relative h-80 overflow-hidden flex-shrink-0 rounded-none">
                  <Image
                    src={caseItem.mapImage}
                    alt={`Mapa del proyecto ${caseItem.projectName}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute top-6 left-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-normal text-white drop-shadow-lg">
                        {String(caseItem.id).padStart(2, "0")}
                      </span>
                      <span className="text-lg text-white/70 ml-1 drop-shadow-lg">
                        /03
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-2/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-700"
                      >
                        <path
                          d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 22V12H15V22"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <h3 className="text-lg font-medium text-white mb-1">
                      ALTHARA
                    </h3>
                    <h4 className="text-2xl font-medium text-white mb-2">
                      {caseItem.projectName}
                    </h4>
                    <p className="text-sm font-light leading-relaxed text-white/90 line-clamp-2 overflow-hidden">
                      {caseItem.description}
                    </p>
                  </div>
                </div>

                <div className="bg-white pt-4 flex-grow">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs font-medium uppercase tracking-[0.2em]"
                        style={{ color: "#95A1B8" }}
                      >
                        {t("labels.roi")}
                      </span>
                      <span className="text-xl font-medium text-althara-black">
                        {caseItem.roi}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs font-medium uppercase tracking-[0.2em]"
                        style={{ color: "#95A1B8" }}
                      >
                        {t("labels.initialInvestment")}
                      </span>
                      <span
                        className="text-sm font-light"
                        style={{ color: "#555555" }}
                      >
                        {caseItem.initialInvestment}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs font-medium uppercase tracking-[0.2em]"
                        style={{ color: "#95A1B8" }}
                      >
                        {t("labels.time")}
                      </span>
                      <span
                        className="text-sm font-light"
                        style={{ color: "#555555" }}
                      >
                        {caseItem.time}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs font-medium uppercase tracking-[0.2em]"
                        style={{ color: "#95A1B8" }}
                      >
                        {t("labels.exitPrice")}
                      </span>
                      <span
                        className="text-sm font-light"
                        style={{ color: "#555555" }}
                      >
                        {caseItem.exitPrice}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <span
                      className="text-xs font-light"
                      style={{ color: "#666666" }}
                    >
                      {caseItem.assetType}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </AnimatedSequence>
      </div>
    </section>
  );
}
