"use client";

import Image from "next/image";
import SectionHeader from "./SectionHeader";
import AnimatedSection, { AnimatedSequence } from "./AnimatedSection";

export default function WhatIsAlthara() {
  return (
    <section id="que-es" className=" bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-12" animation="fadeInLeft" delay={0.2}>
          <SectionHeader letter="B" title="QUE ES" />
        </AnimatedSection>

        <AnimatedSection className="mb-16" animation="fadeInLeft" delay={0.4}>
          <h2 className="text-4xl font-normal text-althara-black leading-tight mb-6">
            Que es Althara
          </h2>
          <div
            className="text-base font-normal leading-relaxed max-w-4xl"
            style={{ color: "#555555" }}
          >
            <p>
              <b>Althara</b> no es un portal.
            </p>
            <p>
              Es una <b>plataforma privada de conexión inteligente</b> donde:
            </p>
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
                DIFERENCIADOR 1
              </div>
              <h3 className="text-2xl font-medium text-althara-black leading-tight">
                Plataforma <br />
                Exclusiva
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
                Validamos y verificamos cada perfil, inversor o propietario.
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
                DIFERENCIADOR 2
              </div>
              <h3 className="text-2xl font-medium text-althara-black leading-tight">
                Algoritmo <br /> Avanzado{" "}
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
                Prioriza compatibilidad real según perfil de riesgo y
                presupuesto
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
                DIFERENCIADOR 3
              </div>
              <h3 className="text-2xl font-medium text-althara-black leading-tight">
                Intermediación <br /> Profesional{" "}
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
                NDA automático y documentación estandarizada con intermedación
                profesional.
              </p>
            </div>
          </div>
        </AnimatedSequence>
      </div>
    </section>
  );
}
