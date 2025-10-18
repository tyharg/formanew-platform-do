import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://formanew.digitalocean.com';

const marketingRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/login', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/signup', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/forgot-password', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/reset-password', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/verify-email', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/magic-link', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/system-status', priority: 0.5, changeFrequency: 'daily' },
  { path: '/connect-demo', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/success', priority: 0.3, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return marketingRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
