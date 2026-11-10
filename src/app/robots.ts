import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Prefixes without trailing slashes so they also match "/dashboard" itself.
const PRIVATE_PATHS = ['/api/', '/dashboard', '/earnings', '/calendar', '/analytics', '/insights', '/settings', '/upload', '/add']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/llms.txt'],
      disallow: PRIVATE_PATHS,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
