import { MetadataRoute } from 'next'

/**
 * ALT-WEB-2026-01 v1.2 §09 — Oxono (6): el sitemap apuntaba a althara.com y
 * declaraba rutas /es y /en que no existen (el idioma se resuelve por cookie,
 * no por segmento de URL). Ambas cosas corregidas.
 */
const baseUrl = 'https://althara.es'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      // Metodología: se revisa con cada versión de las cifras (semestral).
      url: `${baseUrl}/metodologia`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    ...[
      '/aviso-legal',
      '/politica-privacidad',
      '/politica-cookies',
      '/condiciones-uso',
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ]
}
