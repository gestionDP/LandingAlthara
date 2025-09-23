"use client";

import SectionHeader from "./SectionHeader";
import AnimatedSection, { AnimatedSequence } from "./AnimatedSection";

export default function OurProcess() {
  return (
    <section id="nuestro-proceso" className="py-20 bg-althara-dark-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-12" animation="fadeInUp" delay={0.2}>
          <SectionHeader letter="C" title="PROCESO" variant="dark" />
        </AnimatedSection>

        <div className="space-y-16">
          <AnimatedSection
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
            animation="fadeInUp"
            delay={0.4}
          >
            <AnimatedSection animation="fadeInLeft" delay={0.6}>
              <h2 className="text-5xl font-normal text-white leading-tight">
                Nuestro proceso de matching
              </h2>
            </AnimatedSection>

            <AnimatedSection
              className="space-y-4"
              animation="fadeInRight"
              delay={0.8}
            >
              <div className="text-lg font-medium text-white">#01</div>
              <h3 className="text-xl font-medium text-white">
                Verificación Y Perfilado
              </h3>
              <p className="text-base font-light text-gray-300 leading-relaxed">
                Cada usuario, sea propietario o comprador, pasa por un riguroso
                proceso de verificación. Definimos sus necesidades y
                preferencias para asegurar un matching preciso y discreto.
              </p>
            </AnimatedSection>

            <AnimatedSection
              className="space-y-4"
              animation="fadeInRight"
              delay={1.0}
            >
              <div className="text-lg font-medium text-white">#02</div>
              <h3 className="text-xl font-medium text-white">
                Configuración De Preferencias
              </h3>
              <p className="text-base font-light text-gray-300 leading-relaxed">
                Propietarios y compradores definen sus parámetros específicos.
                Nuestro sistema analiza estas preferencias para identificar
                compatibilidades automáticamente.
              </p>
            </AnimatedSection>
          </AnimatedSection>

          <AnimatedSequence
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            animation="fadeInScale"
            baseDelay={1.2}
            delayIncrement={0.2}
          >
            <div className="space-y-4">
              <div className="text-lg font-medium text-white">#03</div>
              <h3 className="text-xl font-medium text-white">
                Matching Inteligente
              </h3>
              <p className="text-base font-light text-gray-300 leading-relaxed">
                Nuestro algoritmo avanzado analiza miles de puntos de datos para
                identificar las compatibilidades perfectas, conectando
                oportunidades exclusivas con inversores cualificados.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-lg font-medium text-white">#04</div>
              <h3 className="text-xl font-medium text-white">
                Conexión Segura Y Asesoramiento
              </h3>
              <p className="text-base font-light text-gray-300 leading-relaxed">
                Una vez hay un match, facilitamos la conexión bajo NDA. Nuestro
                equipo brinda el soporte necesario para asegurar la
                transparencia y seguridad de la operación.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-lg font-medium text-white">#05</div>
              <h3 className="text-xl font-medium text-white">
                Cierre De La Oportunidad
              </h3>
              <p className="text-base font-light text-gray-300 leading-relaxed">
                Tras la conexión y el asesoramiento, las partes proceden al
                cierre de la transacción fuera de la plataforma, con la
                confianza de haber encontrado la oportunidad o el comprador
                ideal.
              </p>
            </div>
          </AnimatedSequence>
        </div>
      </div>
    </section>
  );
}
