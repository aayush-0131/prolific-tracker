import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/earnings/',
        '/calendar/',
        '/analytics/',
        '/settings/',
        '/upload/',
        '/add/',
      ],
    },
    sitemap: 'https://prolific-tracker-alpha.vercel.app/sitemap.xml',
  }
}
