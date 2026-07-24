/**
 * Datos legales del sitio. Sustituir los valores [PENDIENTE] cuando se
 * disponga de la información definitiva: es el ÚNICO archivo que hay que
 * tocar para actualizar todas las páginas legales.
 */

export interface CookieRow {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  category: 'necesarias' | 'analiticas' | 'personalizacion' | 'publicitarias';
}

export interface Processor {
  name: string;
  purpose: string;
  location: string;
  guarantee: string;
}

export const LEGAL = {
  /* ── Titular ─────────────────────────────────────────── */
  companyName: 'Gestión del Papeleo, S.L.',
  cif: 'B42869537',
  address: 'Can Savella 21, bajo',
  phone: '',
  email: 'info@gestiondelpapeleo.com',
  registry: 'Inscrita en el Registro Mercantil de Palma de Mallorca, hoja PM-101496, IRUS 1000380135859, tomo electrónico y folio electrónico. EUID: ES08005.000653140',
  activity: 'Actividades de programación informática (CNAE 6201); prestación de servicios de estudios de mercado, marketing y comunicación; servicios de publicidad, diseño e imagen corporativa; diseño de páginas web y correo electrónico, y actividades vinculadas a la generación y transmisión de información a través de distintos canales',

  /* ── Sitio ───────────────────────────────────────────── */
  siteName: 'Althara',
  domain: 'https://althara.com',
  updated: '24 de julio de 2026',

  /* ── Tratamientos ────────────────────────────────────── */
  hasForms: true,
  sellsOnline: false,
  hasBanner: false,

  /** Encargados de tratamiento / destinatarios de datos. */
  processors: [
    {
        "name": "Vercel Inc.",
        "purpose": "Alojamiento y entrega del sitio web",
        "location": "EE. UU. / UE",
        "guarantee": "Marco de Privacidad de Datos (DPF) y Cláusulas Contractuales Tipo"
    },
    {
        "name": "Resend, Inc.",
        "purpose": "Envío de emails transaccionales (confirmaciones y avisos)",
        "location": "EE. UU.",
        "guarantee": "Cláusulas Contractuales Tipo"
    },
    {
        "name": "Clerk, Inc.",
        "purpose": "Autenticación de usuarios del área privada de inversores (dataroom)",
        "location": "EE. UU.",
        "guarantee": "Marco de Privacidad de Datos (DPF) y Cláusulas Contractuales Tipo"
    }
] as Processor[],

  /** Cookies realmente utilizadas por el sitio. */
  cookieRows: [
    {
        "name": "__session / __client_uat",
        "provider": "Clerk (propia del área privada)",
        "purpose": "Mantener la sesión iniciada en el dataroom de inversores (solo usuarios autenticados)",
        "duration": "Sesión / 7 días",
        "category": "necesarias"
    }
  ] as CookieRow[],
} as const;

export type LegalConfig = typeof LEGAL;
