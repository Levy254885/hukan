import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://hukan.co.ke';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/dashboard',
        '/professional',
        '/list-property',
        '/messages',
        '/signin',
        '/signup',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
