import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://althara.com'

  // Rutas principales con internacionalización
  const routes = [
    '',
    '/es',
    '/en'
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/es' ? 0.9 : 0.8,
  }))
}

