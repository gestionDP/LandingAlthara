import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-black pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="mb-6">
              <Image
                src="/svg/logoFull.svg"
                alt="Althara Logo"
                width={200}
                height={50}
                className="h-10 w-auto brightness-0"
              />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Plataforma privada que conecta propietarios e inversores en
              operaciones singulares, con coinversión estructurada y procesos
              seguros.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#como-funciona"
                  className="text-gray-600 hover:text-black text-sm transition-colors"
                >
                  Cómo Funciona
                </Link>
              </li>
              <li>
                <Link
                  href="#que-es"
                  className="text-gray-600 hover:text-black text-sm transition-colors"
                >
                  Qué Es Althara
                </Link>
              </li>
              <li>
                <Link
                  href="#nuestro-proceso"
                  className="text-gray-600 hover:text-black text-sm transition-colors"
                >
                  Nuestro Proceso
                </Link>
              </li>
              <li>
                <Link
                  href="#para-quien-es"
                  className="text-gray-600 hover:text-black text-sm transition-colors"
                >
                  Para Quién Es
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="mailto:info@althara.com"
                  className="text-gray-600 hover:text-black text-sm transition-colors"
                >
                  info@gestiondelpapeleo.com{" "}
                </Link>
              </li>
              <li>
                <Link
                  href="tel:+34600000000"
                  className="text-gray-600 hover:text-black text-sm transition-colors"
                >
                  +34 695 09 33 33
                </Link>
              </li>
              <li className="text-gray-600 text-sm">Mallorca, España</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2025 Althara. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
