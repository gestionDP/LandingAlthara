"use client";

import Image from "next/image";
import SectionHeader from "./SectionHeader";
import AnimatedSection, { AnimatedSequence } from "./AnimatedSection";

export default function HowItWorks() {
  return (
    <section id="como-funciona" className=" bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-12" animation="fadeInUp" delay={0.2}>
          <SectionHeader letter="A" title="CÓMO FUNCIONA" />
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <AnimatedSection
            className="space-y-8"
            animation="fadeInUp"
            delay={0.4}
          >
            <AnimatedSection animation="fadeInUp" delay={0.5}>
              <h3 className="text-4xl font-normal text-althara-black leading-tight">
                Descubre Nuestro Proceso de Matching Inteligente
              </h3>
            </AnimatedSection>

            <AnimatedSequence
              className="space-y-6"
              animation="fadeInUp"
              baseDelay={0.6}
              delayIncrement={0.2}
            >
              <p
                className="text-base font-normal leading-relaxed"
                style={{ color: "#555555" }}
              >
                <b>Althara</b> es la primera plataforma de matching inteligente
                para activos de lujo off-market.
              </p>
              <p
                className="text-base font-normal leading-relaxed"
                style={{ color: "#555555" }}
              >
                Nuestro algoritmo conecta propietarios de activos premium con
                compradores cualificados mediante un proceso verificado y
                seguro.
              </p>
              <p
                className="text-base font-normal leading-relaxed"
                style={{ color: "#555555" }}
              >
                Con años de experiencia en el sector inmobiliario, nuestro
                equipo combina{" "}
                <b>tecnología avanzada con conocimiento del mercado </b>
                para garantizar conexiones exitosas y discretas.
              </p>
            </AnimatedSequence>
          </AnimatedSection>

          <AnimatedSection
            className="space-y-8"
            animation="fadeInUp"
            delay={0.6}
          >
            <AnimatedSequence
              className="grid grid-cols-2 gap-6"
              animation="fadeInUp"
              baseDelay={0.8}
              delayIncrement={0.2}
            >
              <div className="relative h-96 overflow-hidden">
                <Image
                  src="/png/About1.png"
                  alt="Modern Building Facade"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-96 overflow-hidden">
                <Image
                  src="/png/About.png"
                  alt="Professional Meeting"
                  fill
                  className="object-cover"
                />
              </div>
            </AnimatedSequence>

            <AnimatedSequence
              className="grid grid-cols-2 gap-8"
              animation="fadeInUp"
              baseDelay={1.2}
              delayIncrement={0.2}
            >
              <div className="text-left">
                <div className="text-4xl font-normal text-black mb-2">80%</div>
                <p className="text-sm text-gray-600 leading-tight">
                  del mercado inmobiliario premium se mueve off-market
                </p>
              </div>
              <div className="text-left">
                <div className="text-4xl font-normal text-black mb-2">90%</div>
                <p className="text-sm text-gray-600 leading-tight">
                  De las solicitudes de acceso a Althara son filtradas.{" "}
                </p>
              </div>
            </AnimatedSequence>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
