"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useReveal } from "@/hooks/useReveal";

export default function ManifestoStatement() {
  const t = useTranslations("manifesto");
  const { ref, isRevealed } = useReveal({ threshold: 0.2 });

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative bg-[#0a0a0a] h-screen w-full overflow-hidden flex items-center justify-center"
    >
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/1.mp4"
        >
          <source src="/videos/3.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[#0a0a0a]/[0.25]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-transparent to-[#0a0a0a]/55" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e6e2d7' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 right-0 top-0 h-px bg-[#e6e2d7]/10" />
        <div className="absolute left-0 right-0 bottom-0 h-px bg-[#e6e2d7]/10" />
      </div>

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div
          className={[
            "max-w-5xl mx-auto text-center transition-all duration-1000",
            isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          ].join(" ")}
        >
          <h2 className="font-playfair text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-normal text-[#e6e2d7] leading-[1.1] mb-8">
            {t("statement")}
          </h2>

          {t("subline") && (
            <p className="text-sm md:text-base text-[#e6e2d7]/60 font-light tracking-wide-editorial">
              {t("subline")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
