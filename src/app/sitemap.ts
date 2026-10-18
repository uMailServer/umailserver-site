import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '',
    'docs/',
    'docs/getting-started/',
    'docs/architecture/',
    'docs/deployment/',
    'docs/security/',
    'brand/',
  ].map((path) => ({
    url: `https://umailserver.com/${path}`,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
