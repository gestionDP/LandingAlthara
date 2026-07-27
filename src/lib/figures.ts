/**
 * Cifras públicas (Capa 0) — ALT-WEB-2026-01 v1.2.
 *
 * Único punto de lectura de `src/content/figures.json`. Las cifras son
 * contenido editable: nunca deben incrustarse en un componente ni en una
 * imagen. Cualquier valor `null` significa "pendiente de validación" y NO se
 * renderiza en la capa pública.
 */
import raw from '@/content/figures.json';

export type Locale = 'es' | 'en';

type Localized = { es: string; en: string };

export interface Figure {
  id: string;
  value: Localized;
  label: Localized;
  scope: Localized;
}

export interface PortfolioOperation {
  ref: string;
  typology: Localized | null;
  region: Localized | null;
  year: string | null;
  status: Localized;
}

/** Devuelve el literal en el idioma pedido; `null` si el dato está pendiente. */
export function t(value: Localized | null | undefined, locale: Locale): string | null {
  if (!value) return null;
  return value[locale] ?? value.es;
}

export const FIGURES = raw.figures as Figure[];

export const AS_OF = raw.asOfLabel as Localized;

export const METHODOLOGY_VERSION = raw.methodologyVersion as string;

export const VERIFICATION = raw.verificationDocument as {
  ref: string;
  version: string;
  date: string;
  available: boolean;
};

export const PERIMETER = raw.perimeter as {
  operations: number;
  units: number;
  composition: { place: Localized; operations: number; units: number }[];
};

export const THESIS_DATA = raw.thesis as {
  ticket: Localized | null;
  horizon: Localized | null;
};

export const PORTFOLIO = raw.portfolio as {
  published: boolean;
  operations: PortfolioOperation[];
};

/**
 * Destino del enlace «Documento de verificación» (Capa 1). Accesible desde
 * cualquier página del site, como exige ALT-WEB-2026-01 §04.H.
 *
 * `VERIFICATION.available` es informativo: la comprobación que manda es la de
 * `dataroom/services/verification.ts`, que mira si el PDF firmado está cargado
 * en el almacén en el momento de la descarga.
 */
export const VERIFICATION_HREF = '/verificacion';
export const VERIFICATION_HREF_ABS = '/verificacion';
