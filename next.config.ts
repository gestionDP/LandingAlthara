import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  images: {
    // Los componentes existentes usan quality 80/95; Next 16 exige declararlas.
    qualities: [75, 80, 95],
  },

  /**
   * ALT-WEB-2026-01 v1.2 §09, Oxono (6): redirecciones de las URLs eliminadas.
   *
   * El sitemap antiguo declaraba /es y /en como páginas propias, pero el idioma
   * se resuelve por cookie y nunca hubo segmento de idioma en la ruta. Google
   * puede tenerlas indexadas: se redirigen a la home en lugar de servir 404.
   */
  async redirects() {
    return [
      { source: "/es", destination: "/", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      { source: "/es/:path*", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/", permanent: true },
      // La metodología se pidió también como /methodology en la versión EN.
      { source: "/methodology", destination: "/metodologia", permanent: true },
      { source: "/verification", destination: "/verificacion", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
