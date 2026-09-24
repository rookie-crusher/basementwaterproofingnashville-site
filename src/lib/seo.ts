import type { Metadata } from 'next';
import { site } from '@/data/site';
import type { City } from '@/data/cities';
import type { Service } from '@/data/services';

/**
 * METADATA HELPERS
 *
 * Every page gets a self-referencing canonical. `metadataBase` + a relative
 * `alternates.canonical` makes Next emit an absolute URL. Paths must include
 * the trailing slash to match next.config.mjs `trailingSlash: true`, or the
 * canonical will disagree with the actual URL — a common and quiet SEO bug.
 */

export const metadataBase = new URL(site.domain);

/** Social preview card. Generated from the brand mark — see assets/brand-src. */
export const ogImage = {
  url: '/brand/og-image.png',
  width: 1200,
  height: 630,
  alt: `${site.brand} — ${site.phone.display}`,
};

/** Guard rails: Google truncates titles past ~60 chars, descriptions ~155. */
function warnIfLong(label: string, value: string, max: number) {
  if (process.env.NODE_ENV !== 'production' && value.length > max) {
    console.warn(`[seo] ${label} is ${value.length} chars (soft max ${max}): ${value}`);
  }
}

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  warnIfLong('title', opts.title, 60);
  warnIfLong('description', opts.description, 155);

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    robots: opts.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.path,
      siteName: site.brand,
      locale: 'en_US',
      type: 'website',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [ogImage.url],
    },
  };
}

/**
 * pSEO title/description. Kept under the truncation limits and written to
 * match search intent rather than to pack keywords.
 */
export function pseoMetadata(service: Service, city: City, path: string): Metadata {
  const state = city.stateAbbr.toUpperCase();
  return buildMetadata({
    path,
    title: `${service.name} in ${city.name}, ${state} | ${site.phone.display}`,
    description: `${service.name} for ${city.name} homeowners. Free on-site diagnosis of where water is actually entering. ${city.county} crews. Call ${site.phone.display}.`,
  });
}
