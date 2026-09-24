import Link from 'next/link';
import type { Metadata } from 'next';
import { publishedCities, cities } from '@/data/cities';
import { publishedServices } from '@/data/services';
import { pseoPath } from '@/data/registry';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/schema';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CallButton } from '@/components/CallButton';
import { SmartImage } from '@/components/SmartImage';
import { pageImages } from '@/data/site-images';

export const metadata: Metadata = buildMetadata({
  path: '/areas-we-serve/',
  title: `Areas we serve | Basement Waterproofing Nashville`,
  description: `Basement waterproofing across Nashville, Brentwood, Franklin and Hendersonville, plus the wider Middle Tennessee metro. Call ${site.phone.display}.`,
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Areas we serve', path: '/areas-we-serve/' },
];

export default function AreasPage() {
  const upcoming = cities.filter((c) => c.status === 'draft');

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail)} />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumbs trail={trail} />
        <h1 className="mt-6 text-4xl sm:text-5xl">Areas we serve</h1>
        <p className="mt-5 max-w-prose text-lg leading-relaxed text-grade-800">
          We cover {site.serviceAreaLabel} within roughly {site.serviceRadiusMiles} miles of
          Nashville. The ground conditions vary enough across that radius that each market gets its
          own page rather than a shared template.
        </p>

        <figure className="mt-9">
          <SmartImage
            name={pageImages.nashvilleSkyline.name}
            alt={pageImages.nashvilleSkyline.alt}
            sizes="(min-width: 1152px) 1088px, 100vw"
            aspect="21 / 9"
            className="aspect-[21/9] w-full object-cover"
            priority
          />
          <figcaption className="mt-3 spec text-xs leading-relaxed text-grade-600">
            {pageImages.nashvilleSkyline.caption}
          </figcaption>
        </figure>

        <div className="mt-12 space-y-12">
          {publishedCities.map((c) => (
            <article key={c.slug} className="border-t border-limestone-300 pt-8">
              <div className="flex flex-wrap items-baseline gap-x-4">
                <h2 className="text-3xl">
                  {c.name}, {c.stateAbbr.toUpperCase()}
                </h2>
                <p className="spec text-xs uppercase tracking-[0.14em] text-grade-600">{c.county}</p>
              </div>

              <p className="mt-4 max-w-3xl text-[0.9375rem] leading-relaxed text-grade-800">
                {c.housingStock}
              </p>

              <dl className="mt-5 grid gap-5 spec text-xs sm:grid-cols-3">
                <div>
                  <dt className="text-grade-600">Neighborhoods</dt>
                  <dd className="mt-1 leading-relaxed">{c.neighborhoods.join(' · ')}</dd>
                </div>
                <div>
                  <dt className="text-grade-600">Watersheds</dt>
                  <dd className="mt-1 leading-relaxed">{c.waterways.join(' · ')}</dd>
                </div>
                <div>
                  <dt className="text-grade-600">ZIP codes</dt>
                  <dd className="mt-1 font-mono leading-relaxed">{c.zips.join(' · ')}</dd>
                </div>
              </dl>

              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {publishedServices.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={pseoPath(s, c)}
                      className="text-sm underline decoration-limestone-300 hover:text-water-700"
                    >
                      {s.shortName} in {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {upcoming.length > 0 && (
          <div className="mt-16 grid gap-8 border border-limestone-300 bg-limestone-50 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow">Also covered</p>
              <h2 className="mt-2 font-display text-xl font-bold">
                The rest of the metro, handled the same way
              </h2>
              <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-grade-800">
                We take jobs across the wider metro. The towns below share the same limestone and
                the same storm behaviour as the markets above, and the diagnosis runs identically —
                call and we will tell you what we typically find on your side of the county.
              </p>
              <p className="mt-4 spec text-xs text-grade-600">
                {upcoming.map((c) => `${c.name} (${c.county})`).join(' · ')}
              </p>
              <div className="mt-5">
                <CallButton />
              </div>
            </div>
            <figure>
              <SmartImage
                name={pageImages.brickHome.name}
                alt={pageImages.brickHome.alt}
                sizes="(min-width: 1024px) 480px, 100vw"
                aspect="4 / 3"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="mt-2.5 spec text-xs leading-relaxed text-grade-600">
                {pageImages.brickHome.caption}
              </figcaption>
            </figure>
          </div>
        )}
      </div>
    </>
  );
}
