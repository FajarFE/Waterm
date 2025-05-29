import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/dashboard/monitoring',
        '/dashboard/limitations',
        '/tutorial/*',
        '/signin',
        '/signup',
        '/forgot-password',
      ],
      disallow: [
        '/api',
        '/admin',
        '/private',
        '/dashboard/private/*',
        '/*.json$',
        '/*.xml$',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
