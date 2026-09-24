import { site, formattedAddress } from '@/data/site';
import { aggregate, isSelfServing, type Review } from '@/data/reviews';
import type { City } from '@/data/cities';
import type { Service } from '@/data/services';
import { publishedCities } from '@/data/cities';

/**
 * JSON-LD BUILDERS
 *
 * Rules enforced here:
 *  - Empty values are stripped rather than emitted as "" — blank properties
 *    in structured data are worse than absent ones.
 *  - AggregateRating is only emitted when real reviews exist (see reviews.ts).
 *  - Uses GeneralContractor, the most specific schema.org type available for
 *    this trade, rather than bare LocalBusiness.
 */

const ORG_ID = `${site.domain}/#organization`;
const WEBSITE_ID = `${site.domain}/#website`;

/** Recursively drop undefined, null, '' and empty arrays/objects. */
function prune<T>(input: T): T {
  if (Array.isArray(input)) {
    const arr = input.map(prune).filter((v) => v !== undefined);
    return (arr.length ? arr : undefined) as unknown as T;
  }
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      const pv = prune(v);
      if (pv !== undefined) out[k] = pv;
    }
    return (Object.keys(out).length ? out : undefined) as unknown as T;
  }
  if (input === '' || input === null) return undefined as unknown as T;
  return input;
}

function openingHours() {
  return site.hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  }));
}

function sameAs(): string[] {
  return Object.values(site.profiles).filter(
    (v): v is string => typeof v === 'string' && v.startsWith('http'),
  );
}

/** LocalBusiness / GeneralContractor — the primary entity. */
export function localBusinessSchema() {
  const agg = aggregate();
  const addr = formattedAddress();

  return prune({
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    '@id': ORG_ID,
    name: site.brand,
    legalName: site.legalName,
    url: `${site.domain}/`,
    telephone: site.phone.e164,
    email: site.email,
    logo: {
      '@type': 'ImageObject',
      url: `${site.domain}/brand/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${site.domain}/brand/og-image.png`,
    description: `Basement waterproofing, crawl space encapsulation and foundation drainage across ${site.serviceAreaLabel}.`,
    // Address is only emitted once a real one is entered. A service-area
    // business may legitimately omit it in favour of areaServed.
    address: addr
      ? {
          '@type': 'PostalAddress',
          streetAddress: site.address.streetAddress,
          addressLocality: site.address.locality,
          addressRegion: site.address.region,
          postalCode: site.address.postalCode,
          addressCountry: site.address.country,
        }
      : undefined,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    areaServed: publishedCities.map((c) => ({
      '@type': 'City',
      name: c.name,
      containedInPlace: { '@type': 'AdministrativeArea', name: c.county },
    })),
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: site.geo.latitude,
        longitude: site.geo.longitude,
      },
      geoRadius: String(site.serviceRadiusMiles * 1609),
    },
    openingHoursSpecification: openingHours(),
    priceRange: '$$',
    sameAs: sameAs(),
    // Only present when reviews.ts actually contains reviews.
    aggregateRating: agg
      ? {
          '@type': 'AggregateRating',
          ratingValue: agg.ratingValue,
          reviewCount: agg.reviewCount,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined,
  });
}

export function websiteSchema() {
  return prune({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${site.domain}/`,
    name: site.brand,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-US',
  });
}

export function serviceSchema(service: Service, city: City, url: string) {
  return prune({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} in ${city.name}, ${city.stateAbbr.toUpperCase()}`,
    serviceType: service.name,
    description: service.blurb,
    url,
    provider: { '@id': ORG_ID },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: { '@type': 'AdministrativeArea', name: city.county },
    },
    audience: { '@type': 'Audience', audienceType: 'Homeowners' },
  });
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${site.domain}${t.path}`,
    })),
  };
}

/**
 * Review schema for reviews shown on a page.
 *
 * Self-serving reviews are filtered out here, not at the call site, so no page
 * can accidentally mark them up. Google's review snippet policy excludes
 * reviews hosted on a site owned by the business being reviewed; emitting them
 * risks rich results being disabled for the whole domain.
 *
 * Returns null when nothing is eligible — never emit empty review markup.
 */
export function reviewSchema(list: Review[]) {
  const eligible = list.filter((r) => !isSelfServing(r));
  if (!eligible.length) return null;
  return eligible.map((r) =>
    prune({
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: { '@id': ORG_ID },
      author: { '@type': 'Person', name: r.author },
      datePublished: r.datePublished, // pruned when absent
      reviewBody: r.body,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating),
        bestRating: '5',
        worstRating: '1',
      },
      publisher: { '@type': 'Organization', name: r.source },
    }),
  );
}

/**
 * BlogPosting schema for a guide.
 *
 * `author` is the organisation rather than an invented person: attributing an
 * article to a made-up byline is the kind of easily-checked fabrication that
 * costs trust. Swap in a real Person once you have a named author.
 */
export function articleSchema(
  a: {
    title: string;
    description: string;
    datePublished: string;
    dateModified: string;
    wordCount: number;
    cluster: string;
    keywords: string[];
  },
  url: string,
) {
  return prune({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: a.title,
    description: a.description,
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    wordCount: a.wordCount,
    articleSection: a.cluster,
    inLanguage: 'en-US',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    image: `${site.domain}/brand/og-image.png`,
  });
}
