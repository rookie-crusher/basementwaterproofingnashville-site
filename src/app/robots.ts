import type { MetadataRoute } from 'next';
import { site } from '@/data/site';

// Required by output: 'export' — tells Next this route is fully static.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Crawl budget hygiene. Note /_next/static is deliberately NOT
        // blocked — Google needs the CSS and JS to render the page, and
        // blocking it is a classic self-inflicted ranking problem.
        disallow: ['/api/', '/admin/', '/*?*fbclid=', '/*?*gclid=', '/*?*utm_'],
      },
    ],
    sitemap: `${site.domain}/sitemap.xml`,
    host: site.domain,
  };
}
