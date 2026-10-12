import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.origin || 'https://wenedzi-page.leszczluki.workers.dev';
  const today = new Date().toISOString().slice(0, 10);

  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/dla-harcerzy/patron', priority: '0.9', changefreq: 'monthly' },
    { url: '/dla-rodzicow/nasza-misja', priority: '0.8', changefreq: 'monthly' },
    { url: '/dla-rodzicow/kontakt', priority: '0.8', changefreq: 'monthly' },
    { url: '/dla-rodzicow/zamowienia', priority: '0.8', changefreq: 'weekly' },
    { url: '/dla-rodzicow/rachunek', priority: '0.8', changefreq: 'monthly' },
    { url: '/dla-rodzicow/zgoda', priority: '0.8', changefreq: 'monthly' },
    { url: '/dla-harcerzy/prawo-harcerza', priority: '0.7', changefreq: 'monthly' },
    { url: '/dla-harcerzy/prawo-zucha', priority: '0.7', changefreq: 'monthly' },
    { url: '/dla-harcerzy/spiewnik', priority: '0.7', changefreq: 'monthly' },
    { url: '/dla-harcerzy/ekwipunek-zbiorki', priority: '0.7', changefreq: 'monthly' },
    { url: '/dla-harcerzy/ekwipunek-biwaki', priority: '0.7', changefreq: 'monthly' },
    { url: '/dla-harcerzy/ekwipunek-obozy', priority: '0.7', changefreq: 'monthly' },
    { url: '/galeria', priority: '0.6', changefreq: 'weekly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
