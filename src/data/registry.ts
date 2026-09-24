import { cities, type City } from './cities';
import { services, type Service } from './services';

/**
 * SLUG REGISTRY
 *
 * URL pattern: /[service]-[city]-[state]/
 *   e.g. /basement-waterproofing-brentwood-tn/
 *
 * Why a registry instead of parsing the slug: both service and city names
 * contain hyphens ('crawl-space-encapsulation', 'mount-juliet'), so splitting
 * on '-' is ambiguous and breaks the moment you add a multi-word city. The
 * registry builds the mapping once from the data layer, which makes the
 * routing table a pure function of the data — add a city, get a route.
 *
 * Only published × published combinations are registered, so drafts produce
 * no routes and no sitemap entries.
 */

export type PseoPage = {
  slug: string;
  service: Service;
  city: City;
};

function buildSlug(service: Service, city: City): string {
  return `${service.slug}-${city.slug}-${city.stateAbbr}`;
}

const registry: Map<string, PseoPage> = (() => {
  const map = new Map<string, PseoPage>();
  for (const service of services) {
    if (service.status !== 'published') continue;
    for (const city of cities) {
      if (city.status !== 'published') continue;
      const slug = buildSlug(service, city);
      if (map.has(slug)) {
        throw new Error(`Duplicate pSEO slug generated: ${slug}`);
      }
      map.set(slug, { slug, service, city });
    }
  }
  return map;
})();

export const pseoPages: PseoPage[] = [...registry.values()];

export function getPseoPage(slug: string): PseoPage | undefined {
  return registry.get(slug);
}

/** Canonical path for a service/city pair, with trailing slash. */
export function pseoPath(service: Service, city: City): string {
  return `/${buildSlug(service, city)}/`;
}

/** All static routes, for the sitemap. Keep in sync with the app directory. */
export const staticRoutes = [
  '/',
  '/services/',
  '/areas-we-serve/',
  '/blog/',
  '/testimonials/',
  '/contact/',
] as const;
