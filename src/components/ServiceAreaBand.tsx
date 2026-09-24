import Link from 'next/link';
import { publishedCities, cities } from '@/data/cities';
import { site } from '@/data/site';

/**
 * Service area band. Names every town and neighborhood in crawlable text,
 * which is what actually helps a local query, and links the towns that have a
 * real page rather than linking every name to nothing.
 *
 * No embedded map: a Google Maps iframe costs several hundred kilobytes and a
 * third-party connection for something a list of place names does better for
 * search. The service-area shape is drawn instead.
 */
export function ServiceAreaBand() {
  const drafts = cities.filter((c) => c.status === 'draft');
  const neighborhoods = publishedCities.flatMap((c) => c.neighborhoods);

  return (
    /*
      Light band rather than the accent fill it used to carry. At full
      saturation the sky-blue sat directly under the dark "areas" section and
      read as an alert strip, and white-on-#0ea5e9 body copy was under 3:1.
      A tinted surface keeps the section distinct without shouting.
    */
    <section aria-labelledby="area-heading" className="border-y border-limestone-300 bg-limestone-200 text-grade-950">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-water-700">
              Proudly serving
            </p>
            <h2 id="area-heading" className="mt-2 text-3xl uppercase tracking-tight sm:text-4xl">
              {site.serviceAreaLabel}
            </h2>
            <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-grade-800">
              Within roughly {site.serviceRadiusMiles} miles of Nashville. Towns with their own page
              have local ground conditions written up; the rest we cover by phone.
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-2">
              {publishedCities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/basement-waterproofing-${c.slug}-${c.stateAbbr}/`}
                    className="font-display font-bold text-grade-900 underline decoration-water-500 decoration-2 underline-offset-2 hover:text-water-700"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              {drafts.map((c) => (
                <li key={c.slug} className="spec text-sm text-grade-800">
                  {c.name}
                </li>
              ))}
            </ul>

            <p className="mt-6 max-w-2xl spec text-xs leading-relaxed text-grade-800">
              {neighborhoods.join(' · ')}
            </p>
          </div>

          {/* Service radius, drawn rather than embedded */}
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 240 240" className="w-full max-w-[240px]" role="img" aria-label={`Service radius of about ${site.serviceRadiusMiles} miles around Nashville`}>
              <circle cx="120" cy="120" r="104" fill="none" stroke="var(--color-grade-950)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
              <circle cx="120" cy="120" r="68" fill="var(--color-grade-950)" opacity="0.07" />
              <circle cx="120" cy="120" r="68" fill="none" stroke="var(--color-grade-950)" strokeWidth="1.5" />
              {publishedCities.map((c, i) => {
                const angle = (i / publishedCities.length) * Math.PI * 2 - Math.PI / 2;
                const r = 46 + (i % 2) * 26;
                const x = 120 + Math.cos(angle) * r;
                const y = 120 + Math.sin(angle) * r;
                return (
                  <g key={c.slug}>
                    <circle cx={x} cy={y} r="4" fill="var(--color-grade-950)" />
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                      fontSize="9"
                      fill="var(--color-grade-950)"
                    >
                      {c.name}
                    </text>
                  </g>
                );
              })}
              <circle cx="120" cy="120" r="6" fill="var(--color-grade-950)" />
              <text x="120" y="138" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-grade-950)">
                NASHVILLE
              </text>
              <text x="120" y="234" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--color-grade-800)">
                {site.serviceRadiusMiles} MILE RADIUS
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
