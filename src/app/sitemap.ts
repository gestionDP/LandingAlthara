import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://althara.com'

  // Rutas principales con internacionalización
  const routes = [
    '',
    '/es',
    '/en'
  ]

  const mainEntries = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/es' ? 0.9 : 0.8,
  }))

  const legalEntries = [
    '/aviso-legal',
    '/politica-privacidad',
    '/politica-cookies',
    '/condiciones-uso',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }))

  return [...mainEntries, ...legalEntries]
}

