import Link from 'next/link';
import type { Metadata } from 'next';
import { publishedServices } from '@/data/services';
import { publishedCities } from '@/data/cities';
import { pseoPath } from '@/data/registry';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/schema';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CallButton } from '@/components/CallButton';
import { SmartImage } from '@/components/SmartImage';
import { workImagesFor } from '@/data/site-images';

export const metadata: Metadata = buildMetadata({
  path: '/services/',
  title: `Services | Basement Waterproofing Nashville`,
  description: `Basement waterproofing and crawl space encapsulation across Middle Tennessee. What each service involves, what it costs to diagnose, and how long it takes. Call ${site.phone.display}.`,
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services/' },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(trail)} />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumbs trail={trail} />
        <h1 className="mt-6 text-4xl sm:text-5xl">Services</h1>
        <p className="mt-5 max-w-prose text-lg leading-relaxed text-grade-800">
          Two things go wrong below grade in Middle Tennessee, and they are not the same problem.
          Every job starts with establishing which one you have.
        </p>

        <div className="mt-12 space-y-16">
          {publishedServices.map((s) => {
            const gallery = workImagesFor(s.slug, 0, 3);
            return (
            <article key={s.slug}>
              <h2 className="text-3xl">{s.name}</h2>
              <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-grade-800">
                {s.blurb}
              </p>

              {gallery.length > 0 && (
                <div className="mt-7 grid gap-6 sm:grid-cols-3">
                  {gallery.map((img) => (
                    <figure key={img.name}>
                      <SmartImage
                        name={img.name}
                        alt={img.alt}
                        sizes="(min-width: 640px) 33vw, 100vw"
                        aspect="4 / 3"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <figcaption className="mt-2.5 spec text-xs leading-relaxed text-grade-600">
                        {img.caption}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}

              <div className="mt-7 grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="eyebrow">Symptoms</h3>
                  <ul className="mt-3 space-y-2">
                    {s.symptoms.map((sym) => (
                      <li key={sym} className="flex gap-2.5 text-[0.9375rem]">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-water-500" />
                        {sym}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="eyebrow">Method</h3>
                  <ol className="mt-3 space-y-3">
                    {s.process.map((p, i) => (
                      <li key={p.title} className="flex gap-3">
                        <span className="font-mono text-xs text-water-700">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="font-display text-[0.9375rem] font-bold">{p.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-grade-600">{p.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <p className="mt-6 spec text-xs text-grade-600">{s.timeline}</p>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-limestone-300 pt-4">
                <span className="spec text-xs text-grade-600">By area:</span>
                {publishedCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={pseoPath(s, c)}
                    className="spec text-xs underline decoration-limestone-300 hover:text-water-700"
                  >
                    {c.name}, {c.stateAbbr.toUpperCase()}
                  </Link>
                ))}
              </div>
            </article>
            );
          })}
        </div>

        <div className="mt-16">
          <CallButton />
        </div>
      </div>
    </>
  );
}
