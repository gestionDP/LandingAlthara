import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  images: {
    // Los componentes existentes usan quality 80/95; Next 16 exige declararlas.
    qualities: [75, 80, 95],
  },
};

export default withNextIntl(nextConfig);
