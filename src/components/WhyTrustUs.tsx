"use client";

import { useState } from "react";
import Image from "next/image";
import SectionHeader from "./SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import ContactModal from "./ContactModal";
import AnimatedSection, { AnimatedSequence } from "./AnimatedSection";

export default function WhyTrustUs() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <section id="por-que-confiar" className="bg-white">
      <div className="relative h-70 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/png/Cta.png"
            alt="Modern Interior Background"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center">
          <h2 className="text-4xl font-normal text-white text-center mb-8">
            Por qué confiar en Althara
          </h2>
          <button
            onClick={openModal}
            className="bg-white border border-black text-black px-8 py-3 rounded-full flex items-center hover:bg-gray-50 transition-colors shadow-lg"
          >
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Image
                src="/svg/arrow.svg"
                alt="Arrow"
                width={26}
                height={26}
                className="text-white"
              />
            </div>
            <span className="font-medium ml-3 cursor-pointer">CONTACT US</span>
          </button>
        </div>
      </div>

      <AnimatedSection
        className="py-20 bg-althara-dark-blue"
        animation="fadeInUp"
        delay={0.2}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="mb-12" animation="fadeInUp" delay={0.4}>
            <SectionHeader letter="E" title="POR QUÉ ALTHARA" variant="dark" />
          </AnimatedSection>

          <AnimatedSequence
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            animation="fadeInScale"
            baseDelay={0.6}
            delayIncrement={0.2}
          >
            <div className="h-full">
              <Card className="p-8 h-full flex flex-col hover:scale-105 transition-transform duration-300 ease-out cursor-pointer">
                <CardContent className="p-0 flex flex-col h-full">
                  <p className="text-lg font-normal text-black leading-relaxed mb-8 flex-grow">
                    El 80% de los activos de lujo se negocian discretamente.
                    Althara te abre las puertas a este mercado exclusivo.
                  </p>
                  <div className="flex items-center space-x-6 mt-auto">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <Image
                        src="/svg/logo.svg"
                        alt="Althara Logo"
                        width={32}
                        height={32}
                        className="text-black"
                      />
                    </div>
                    <div>
                      <div className="text-md font-semibold text-black">
                        Acceso privilegiado
                      </div>
                      <div className="text-sm text-gray-600">
                        Oportunidades únicas
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="h-full">
              <Card className="p-8 h-full flex flex-col shadow-sm hover:scale-105 transition-transform duration-300 ease-out cursor-pointer">
                <CardContent className="p-0 flex flex-col h-full">
                  <p className="text-lg font-normal text-black leading-relaxed mb-8 flex-grow">
                    Nuestro algoritmo conecta tus preferencias con activos que
                    realmente te interesan, ahorrándote tiempo y esfuerzo.
                  </p>
                  <div className="flex items-center space-x-6 mt-auto">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <Image
                        src="/svg/logo.svg"
                        alt="Althara Logo"
                        width={32}
                        height={32}
                        className="text-black"
                      />
                    </div>
                    <div>
                      <div className="text-md font-semibold text-black">
                        Conexión inteligente
                      </div>
                      <div className="text-sm text-gray-600">
                        Define tus preferencias
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="h-full">
              <Card className="p-8 h-full flex flex-col shadow-sm hover:scale-105 transition-transform duration-300 ease-out cursor-pointer">
                <CardContent className="p-0 flex flex-col h-full">
                  <p className="text-lg font-normal text-black leading-relaxed mb-8 flex-grow">
                    Cada interacción y transacción se gestiona con la máxima
                    profesionalidad, discreción y un proceso legal transparente.
                  </p>
                  <div className="flex items-center space-x-6 mt-auto">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <Image
                        src="/svg/logo.svg"
                        alt="Althara Logo"
                        width={32}
                        height={32}
                        className="text-black"
                      />
                    </div>
                    <div>
                      <div className="text-md font-semibold text-black">
                        Seguridad y confianza
                      </div>
                      <div className="text-sm text-gray-600">
                        Verificación y soporte
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSequence>
        </div>
      </AnimatedSection>

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </section>
  );
}
