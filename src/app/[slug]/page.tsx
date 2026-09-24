import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { pseoPages, getPseoPage, pseoPath } from '@/data/registry';
import { publishedCities } from '@/data/cities';
import { publishedServices } from '@/data/services';
import { reviewsFor } from '@/data/reviews';
import { site } from '@/data/site';
import { workImagesFor } from '@/data/site-images';
import { pseoMetadata } from '@/lib/seo';
import {
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
  reviewSchema,
} from '@/lib/schema';

import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CallButton } from '@/components/CallButton';
import { LeadFormSlot } from '@/components/LeadFormSlot';
import { TrustBadges } from '@/components/TrustBadges';
import { Faq } from '@/components/Faq';
import { Reviews } from '@/components/Reviews';
import { SmartImage } from '@/components/SmartImage';
import { FoundationSection } from '@/components/FoundationSection';

/**
 * THE pSEO TEMPLATE
 *
 * One route handles every service × city combination. Uniqueness comes from
 * the data layer, not from this file: the geology, drainage, permitting,
 * neighborhoods, housing stock and FAQs below are all city-specific prose,
 * and the FAQ generator composes answers from that prose rather than
 * substituting a city name into a fixed sentence.
 *
 * If you ever find yourself adding a city without writing its local blocks,
 * the build will stop you (src/lib/validate.ts). That is the point.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return pseoPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPseoPage(slug);
  if (!page) return {};
  return pseoMetadata(page.service, page.city, `/${slug}/`);
}

export default async function PseoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getPseoPage(slug);
  if (!page) notFound();

  const { service, city } = page;
  const state = city.stateAbbr.toUpperCase();
  const path = `/${slug}/`;
  const url = `${site.domain}${path}`;

  // Combined FAQs: service-specific (composed from city data) + city-specific.
  const faqs = [...service.faqsFor(city), ...city.faqs];

  const pageReviews = reviewsFor(city.slug, service.slug, 3);

  const trail = [
    { name: 'Home', path: '/' },
    { name: service.shortName, path: '/services/' },
    { name: `${city.name}, ${state}`, path },
  ];

  const siblingServices = publishedServices.filter((s) => s.slug !== service.slug);
  const siblingCities = publishedCities.filter((c) => c.slug !== city.slug);

  // Rotate the reference photography by city so the four pages for one
  // service do not open with an identical trio.
  const cityIndex = Math.max(0, publishedCities.findIndex((c) => c.slug === city.slug));
  const workImages = workImagesFor(service.slug, cityIndex);

  return (
    <>
      <JsonLd data={serviceSchema(service, city, url)} />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={breadcrumbSchema(trail)} />
      <JsonLd data={reviewSchema(pageReviews)} />

      {/* ── HERO: form and phone above the fold ─────────────────────────── */}
      <section className="border-b border-limestone-200 bg-limestone-50">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6">
          <Breadcrumbs trail={trail} />

          <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-x-14 lg:gap-y-12">
            <div className="lg:col-start-1 lg:row-start-1">
              <p className="eyebrow">
                {city.name} &middot; {city.county}
              </p>
              <h1 className="mt-3 text-[2.125rem] leading-[1.05] sm:text-5xl">
                {service.name} in {city.name}, {state}
              </h1>

              <p className="mt-5 max-w-prose text-lg leading-relaxed text-grade-800">
                {service.blurb}
              </p>
              <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-grade-600">
                {city.housingStock}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <CallButton />
                <a href="#request-inspection" className="cta-secondary">
                  Get a free diagnosis
                </a>
              </div>

              <div className="mt-6">
                <TrustBadges compact />
              </div>
            </div>

            <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-6">
              <LeadFormSlot
                heading={`Book a ${city.name} inspection`}
                sub={`We diagnose the water path on site before quoting. ${city.driveTime}.`}
              />
            </div>

            {/* The signature drawing: the mechanism, not a stock photo. Row 2
                of column 1, so on desktop it fills the space beside the tall
                form instead of leaving a gap, and on mobile it falls after the
                form in DOM order. */}
            <figure className="lg:col-start-1 lg:row-start-2">
              <FoundationSection className="w-full" />
              <figcaption className="mt-3 max-w-3xl spec text-xs leading-relaxed text-grade-600">
                How water reaches foundations in {city.county}: rain saturates thin topsoil, meets
                shallow limestone it cannot pass through, and travels sideways until it finds the
                joint between your wall and footing.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── SYMPTOMS ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="eyebrow">What you are seeing</p>
        <h2 className="mt-2 text-3xl">Signs that bring {city.name} homeowners to us</h2>
        <ul className="mt-7 grid gap-px bg-limestone-300 sm:grid-cols-2 lg:grid-cols-3">
          {service.symptoms.map((s) => (
            <li key={s} className="flex gap-3 bg-limestone-100 p-4">
              <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 bg-water-500" />
              <span className="text-[0.9375rem] leading-relaxed">{s}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── LOCAL GROUND CONDITIONS (below grade treatment) ─────────────── */}
      <section className="below-grade">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Ground conditions</p>
          <h2 className="mt-2 max-w-3xl text-3xl sm:text-4xl">
            What {service.shortName.toLowerCase()} in {city.name} has to deal with
          </h2>

          {/* Unique to this service AND this city — see Service.localLens */}
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-limestone-100">
            {service.localLens(city)}
          </p>

          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <article>
              <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-water-300">
                Geology
              </h3>
              <div className="prose-local mt-4 text-[0.9375rem] text-limestone-200">
                <p>{city.local.geology}</p>
              </div>
            </article>

            <article>
              <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-water-300">
                How water reaches foundations here
              </h3>
              <div className="prose-local mt-4 text-[0.9375rem] text-limestone-200">
                <p>{city.local.drainage}</p>
              </div>
            </article>
          </div>

          {/* Local geography — real anchors, used because they matter */}
          <div className="mt-12 grid gap-8 border-t border-grade-800 pt-8 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-grade-400">
                Watersheds we work around
              </p>
              <p className="mt-2 text-sm text-limestone-200">{city.waterways.join(' · ')}</p>
            </div>
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-grade-400">
                Neighborhoods served
              </p>
              <p className="mt-2 text-sm text-limestone-200">{city.neighborhoods.join(' · ')}</p>
            </div>
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-grade-400">
                ZIP codes
              </p>
              <p className="mt-2 font-mono text-sm text-limestone-200">{city.zips.join(' · ')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS: a genuine sequence, so numbering carries meaning ───── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Method</p>
        <h2 className="mt-2 text-3xl">How we approach {service.name.toLowerCase()}</h2>
        <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-grade-600">
          {service.timeline}
        </p>

        <ol className="mt-9 space-y-px bg-limestone-300">
          {service.process.map((step, i) => (
            <li key={step.title} className="bg-limestone-100 p-5 sm:p-6">
              <div className="flex gap-5">
                <span className="shrink-0 font-mono text-sm text-water-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-grade-800">
                    {step.detail}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── PERMITS & CODE, per jurisdiction ────────────────────────────── */}
      <section className="border-y border-limestone-200 bg-limestone-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="eyebrow">Permits and code</p>
          <h2 className="mt-2 text-3xl">
            Working under {city.county} rules
          </h2>
          <div className="prose-local mt-5 max-w-3xl text-[0.9375rem] text-grade-800">
            <p>{city.local.codes}</p>
          </div>

          <dl className="mt-8 max-w-3xl border border-limestone-300 bg-limestone-100 p-5 spec">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-grade-600">Authority</dt>
              <dd className="font-semibold text-grade-900">{city.local.authority.name}</dd>
            </div>
            {city.local.authority.phone && (
              <div className="mt-2 flex flex-wrap gap-x-2">
                <dt className="text-grade-600">Phone</dt>
                <dd>
                  <a href={`tel:${city.local.authority.phone.replace(/\D/g, '')}`} className="underline">
                    {city.local.authority.phone}
                  </a>
                </dd>
              </div>
            )}
            {city.local.authority.note && (
              <div className="mt-3 border-t border-limestone-300 pt-3">
                <dd className="leading-relaxed text-grade-800">{city.local.authority.note}</dd>
              </div>
            )}
          </dl>

          <p className="mt-4 max-w-3xl spec text-xs leading-relaxed text-grade-600">
            Code and permitting requirements change. Verify anything on this page against the
            authority above before relying on it — we confirm requirements for your address as
            part of the inspection.
          </p>
        </div>
      </section>

      {/* ── WHAT THE WORK LOOKS LIKE ───────────────────────────────────── */}
      {workImages.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="eyebrow">What the work looks like</p>
          <h2 className="mt-2 text-3xl">
            {service.shortName}, from the ground up
          </h2>
          <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-grade-600">
            Reference photographs of the assemblies and conditions described above, so you know
            what is being quoted before anyone opens the ground.
          </p>
          <div className="mt-7 grid gap-6 sm:grid-cols-3">
            {workImages.map((img) => (
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
        </section>
      )}

      {/* ── REVIEWS: city + service relevant, real only ─────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <Reviews reviews={pageReviews} context={`${city.name}`} />
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-limestone-200 bg-limestone-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <Faq
            faqs={faqs}
            heading={`${service.shortName} in ${city.name}: common questions`}
          />
        </div>
      </section>

      {/* ── INTERNAL LINKING: the crawl path between programmatic pages ─── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2">
          {siblingServices.length > 0 && (
            <div>
              <p className="eyebrow">Other services in {city.name}</p>
              <ul className="mt-4 space-y-2">
                {siblingServices.map((s) => (
                  <li key={s.slug}>
                    <Link href={pseoPath(s, city)} className="underline decoration-limestone-300 hover:text-water-700">
                      {s.name} in {city.name}, {state}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {siblingCities.length > 0 && (
            <div>
              <p className="eyebrow">{service.shortName} nearby</p>
              <ul className="mt-4 space-y-2">
                {siblingCities.map((c) => (
                  <li key={c.slug}>
                    <Link href={pseoPath(service, c)} className="underline decoration-limestone-300 hover:text-water-700">
                      {service.shortName} in {c.name}, {c.stateAbbr.toUpperCase()}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ── CLOSING CTA ─────────────────────────────────────────────────── */}
      <section className="below-grade">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl sm:text-4xl">Find out where the water is coming from</h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-limestone-200">
            A free on-site diagnosis in {city.name} — we identify the water path and give you a
            written scope. {site.emergencyNote}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CallButton />
            <a href="#request-inspection" className="cta-secondary">
              Request an inspection
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
