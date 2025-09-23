"use client";

import Image from "next/image";
import SectionHeader from "./SectionHeader";
import AnimatedSection, { AnimatedSequence } from "./AnimatedSection";
import { motion } from "framer-motion";

export default function WhoIsItFor() {
  return (
    <section id="para-quien-es" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-12" animation="fadeInUp" delay={0.2}>
          <SectionHeader letter="D" title="PARA QUIEN" />
        </AnimatedSection>

        <AnimatedSection className="mb-16" animation="fadeInUp" delay={0.4}>
          <h2 className="text-4xl font-normal text-althara-black leading-tight mb-6">
            Para Quién Es Althara
          </h2>
          <p
            className="text-base font-normal leading-relaxed max-w-4xl"
            style={{ color: "#555555" }}
          >
            Nuestra plataforma está diseñada para perfiles exclusivos que
            valoran la discreción, la eficiencia y el acceso a oportunidades
            únicas en el mercado de activos de lujo off-market.
          </p>
        </AnimatedSection>

        <AnimatedSequence
          className="space-y-10"
          animation="fadeInUp"
          baseDelay={0.6}
          delayIncrement={0.2}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <motion.div
              className=" rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.05,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.h3 className="text-2xl font-medium text-althara-black leading-tight transition-colors duration-500">
                Inversores
              </motion.h3>
            </motion.div>

            <motion.div
              className="rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.05,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.p
                className="text-base font-normal leading-relaxed transition-colors duration-500"
                style={{ color: "#555555" }}
              >
                Para quienes buscan diversificar su cartera con activos únicos
                que ofrecen potencial de revalorización superior al mercado
                tradicional.
              </motion.p>
            </motion.div>

            <motion.div
              className="flex justify-center lg:justify-end rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.1,
                x: 10,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="relative h-48 w-48 sm:h-40 sm:w-40 lg:h-32 lg:w-32 overflow-hidden">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <motion.div
              className=" rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.05,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.h3 className="text-2xl font-medium text-althara-black leading-tight transition-colors duration-500">
                Propietarios
              </motion.h3>
            </motion.div>

            <motion.div
              className=" rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.05,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.p
                className="text-base font-normal leading-relaxed transition-colors duration-500"
                style={{ color: "#555555" }}
              >
                Para quienes valoran la discreción total y no quieren que sus
                activos aparezcan en portales públicos o redes sociales.
              </motion.p>
            </motion.div>

            <motion.div
              className="flex justify-center lg:justify-end rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.1,
                x: 10,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="relative h-48 w-48 sm:h-40 sm:w-40 lg:h-32 lg:w-32 overflow-hidden">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <motion.div
              className=" rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.05,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.h3 className="text-2xl font-medium text-althara-black leading-tight transition-colors duration-500">
                Asesores
              </motion.h3>
            </motion.div>

            <motion.div
              className=" rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.05,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.p
                className="text-base font-normal leading-relaxed transition-colors duration-500"
                style={{ color: "#555555" }}
              >
                Para profesionales que necesitan herramientas avanzadas para
                conectar oportunidades exclusivas con clientes cualificados.
              </motion.p>
            </motion.div>

            <motion.div
              className="flex justify-center lg:justify-end rounded-lg transition-all duration-500 cursor-pointer"
              whileHover={{
                scale: 1.1,
                x: 10,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="relative h-48 w-48 sm:h-40 sm:w-40 lg:h-32 lg:w-32 overflow-hidden">
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
