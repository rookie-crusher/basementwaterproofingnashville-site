import Link from 'next/link';
import type { Metadata } from 'next';

import { site } from '@/data/site';
import { publishedCities } from '@/data/cities';
import { publishedServices } from '@/data/services';
import { pseoPath } from '@/data/registry';
import { reviews } from '@/data/reviews';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';

import { JsonLd } from '@/components/JsonLd';
import { CallButton } from '@/components/CallButton';
import { LeadFormSlot } from '@/components/LeadFormSlot';
import { TrustBadges, AssociationLogos } from '@/components/TrustBadges';
import { FoundationSection } from '@/components/FoundationSection';
import { Faq } from '@/components/Faq';
import { Reviews } from '@/components/Reviews';
import { WhatToExpect } from '@/components/WhatToExpect';
import { ServiceAreaBand } from '@/components/ServiceAreaBand';
import { SmartImage } from '@/components/SmartImage';
import { QuickLinks } from '@/components/QuickLinks';
import { GuaranteeSeal } from '@/components/GuaranteeSeal';
import { Icon } from '@/components/Icons';
import { leadImageFor, pageImages } from '@/data/site-images';
import { allArticles, cardImage } from '@/lib/blog';

export const metadata: Metadata = buildMetadata({
  path: '/',
  title: `Basement Waterproofing Nashville TN | ${site.phone.display}`,
  description: `Basement waterproofing and crawl space encapsulation across Nashville, Brentwood, Franklin and Hendersonville. Free on-site diagnosis of where water is entering. Call ${site.phone.display}.`,
});

const homeFaqs = [
  {
    q: 'Why do Nashville basements leak during a storm but stay dry otherwise?',
    a: 'Middle Tennessee sits on shallow limestone. Rain cannot percolate down through it, so water saturates the thin topsoil, reaches the rock, and then moves horizontally along that contact until something interrupts it — often a foundation wall. That is why the water arrives as a fast pulse during a storm rather than rising slowly from below, and why grading and discharge frequently matter more than pump capacity.',
  },
  {
    q: 'Do you charge for the inspection?',
    a: 'No. The on-site diagnosis is free and comes with a written scope. We do not quote a system over the phone for a house we have not looked at, because storm-driven lateral flow, a genuine water table and a plumbing failure all look identical once the floor is wet and each one needs a different fix.',
  },
  {
    q: 'How do I know whether I need waterproofing or crawl space work?',
    a: 'Many Nashville homes have crawl spaces rather than full basements, because excavating limestone is expensive. If your complaint is a musty smell that gets worse in summer, cupping floors or humidity you cannot control, that is usually a crawl space moisture problem. Standing water against a below-grade wall after rain is a drainage problem. The inspection settles it.',
  },
  {
    q: 'Which areas do you cover?',
    a: `We work across ${site.serviceAreaLabel}, with published service pages for ${publishedCities.map((c) => c.name).join(', ')}. Call ${site.phone.display} if your town is not listed — we cover most of the Nashville metro within about ${site.serviceRadiusMiles} miles.`,
  },
];

/** The guarantee bullets, kept beside the seal so they read as one claim. */
const guaranteeCovers = [
  'Interior and exterior drainage systems',
  'Crawl space encapsulation and liner work',
  'Foundation dampproofing and waterproofing',
  'Sump systems, discharge lines and outfalls',
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }])} />
      <JsonLd data={faqSchema(homeFaqs)} />

      {/* ── HERO ─────────────────────────────────────────────────────────
          Photographic hero with the form card sitting on top of it, so the
          headline, the phone and the form all land in one viewport. The
          image is the LCP element and is the only one on the page marked
          priority. */}
      <section className="relative isolate overflow-hidden bg-grade-950">
        <SmartImage
          name="work-foundation-excavation"
          alt="Excavator working alongside the foundation of a house under construction"
          sizes="100vw"
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Two overlays: a light flat scrim so no part of the photograph is
            ever bright enough to fight white text, plus a left-weighted
            gradient that thickens behind the headline column only. Together
            they clear 7:1 on the headline while leaving the right-hand side of
            the photograph legible as a photograph. */}
        <div aria-hidden="true" className="absolute inset-0 bg-grade-950/35" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-grade-950 via-grade-950/75 to-grade-950/25"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="max-w-xl">
              <p className="eyebrow text-water-300">Nashville sits on limestone</p>
              <h1 className="mt-4 text-[2.125rem] leading-[1.03] text-limestone-50 sm:text-[3.25rem]">
                Water doesn&rsquo;t rise into a Nashville basement. It arrives sideways.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-limestone-200">
                Shallow limestone bedrock stops rain from soaking downward, so it travels along the
                rock until it reaches your foundation. Fixing that means finding the path the water
                is taking — not selling you a bigger pump.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <CallButton />
                <a href="#request-inspection" className="cta-secondary border-limestone-300 text-limestone-50 hover:bg-white/10">
                  Get a free diagnosis
                </a>
              </div>

              <ul className="mt-8 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {[
                  'Free on-site diagnosis',
                  'Written scope before work',
                  'No quotes over the phone',
                  '30+ years in Middle Tennessee',
                ].map((claim) => (
                  <li key={claim} className="flex items-center gap-2 text-[0.9375rem] text-limestone-200">
                    <Icon name="check" className="h-4 w-4 text-water-300" />
                    {claim}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:sticky lg:top-6">
              <LeadFormSlot />
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* ── INTRO ───────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-[2rem] uppercase tracking-tight sm:text-[2.75rem]">
            Basement Waterproofing Contractors
          </h2>
          <p className="mt-3 font-display text-xl font-semibold text-grade-600 sm:text-2xl">
            in Nashville, Brentwood, Franklin and Hendersonville
          </p>
          <p className="mx-auto mt-7 max-w-2xl font-display text-[0.9375rem] font-bold text-grade-900">
            Basement waterproofing, crawl space encapsulation, foundation drainage.
          </p>

          <div className="mx-auto mt-6 max-w-3xl space-y-4 text-left text-[0.9375rem] leading-relaxed text-grade-800 sm:text-center">
            <p>
              Our expertise is keeping water out of where it should not be, and repairing what it
              has already damaged. From <strong>footing drains, sump systems, crawl space liners,
              stem walls and below-grade masonry</strong>, we specialise in{' '}
              <strong>drainage, waterproofing and encapsulation</strong> designed around the ground
              your house actually sits on.
            </p>
            <p>
              Middle Tennessee is not a water-table problem. It is a storm-flow problem, and that
              distinction decides whether a repair holds for twenty years or fails at the next
              heavy rain. Every job starts with establishing which one you have.
            </p>
            <p>
              All of our work is covered by a written scope issued before anything starts — in
              enough detail that you can hand it to another contractor and compare like for like.
            </p>
          </div>

          <figure className="mt-12">
            <FoundationSection className="w-full" />
            <figcaption className="mt-3 spec text-xs leading-relaxed text-grade-600">
              The mechanism behind most Middle Tennessee water intrusion: perched water moving
              laterally on the soil–bedrock contact, entering at the cold joint between wall and
              footing.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── ESTIMATE BAND ───────────────────────────────────────────────── */}
      <section className="border-y border-limestone-200 bg-limestone-100">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="eyebrow">No cost, no obligation</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Need an estimate?</h2>
            <p className="mt-4 max-w-prose text-[0.9375rem] leading-relaxed text-grade-800">
              We walk the outside first, then the inside, then tell you where the water is entering
              and what it will take to stop it. You get that in writing whether or not you hire us.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact/" className="cta-primary">
                Request a consultation
              </Link>
              <CallButton variant="secondary" />
            </div>
          </div>
          <figure className="order-1 lg:order-2">
            <SmartImage
              name={pageImages.consultation.name}
              alt={pageImages.consultation.alt}
              sizes="(min-width: 1024px) 528px, 100vw"
              aspect="16 / 10"
              className="aspect-[16/10] w-full object-cover"
            />
            <figcaption className="mt-2.5 spec text-xs leading-relaxed text-grade-600">
              {pageImages.consultation.caption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">What we do</p>
          <h2 className="mt-2 text-3xl uppercase tracking-tight sm:text-4xl">
            Two problems, diagnosed before they are quoted
          </h2>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {publishedServices.map((s) => {
            const lead = leadImageFor(s.slug);
            return (
              <article key={s.slug} className="flex flex-col border border-limestone-300 bg-white">
                {lead && (
                  <SmartImage
                    name={lead.name}
                    alt={lead.alt}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    aspect="16 / 9"
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-center font-display text-xl font-extrabold">{s.name}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-grade-800">{s.blurb}</p>
                  <ul className="mt-4 space-y-2">
                    {s.symptoms.slice(0, 3).map((sym) => (
                      <li key={sym} className="flex gap-2.5 text-sm text-grade-600">
                        <Icon name="check" className="mt-0.5 h-4 w-4 text-water-500" />
                        {sym}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                    {publishedCities.map((c) => (
                      <Link
                        key={c.slug}
                        href={pseoPath(s, c)}
                        className="spec text-xs underline decoration-limestone-300 hover:text-water-700"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/services/"
                    className="mt-6 flex min-h-[3rem] items-center justify-center border border-grade-600 px-4 font-display text-[0.75rem] font-bold uppercase tracking-[0.14em] text-grade-900 transition-colors hover:bg-grade-950 hover:text-limestone-50"
                  >
                    {s.shortName} services
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        </div>
      </section>

      {/* ── AREAS ───────────────────────────────────────────────────────── */}
      <section className="below-grade">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Where we work</p>
          <h2 className="mt-2 text-3xl uppercase tracking-tight sm:text-4xl">
            Four markets, four different water problems
          </h2>
          <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-limestone-200">
            The ground changes noticeably across the metro, and so does the right repair. These
            pages describe what we actually find in each area rather than repeating the same copy
            with the town name swapped out.
          </p>

          <div className="mt-10 grid gap-px bg-grade-800 sm:grid-cols-2 lg:grid-cols-4">
            {publishedCities.map((c) => (
              <article key={c.slug} className="bg-grade-950 p-5">
                <h3 className="font-display text-lg font-extrabold text-limestone-50">{c.name}</h3>
                <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-grade-400">
                  {c.county}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-limestone-200">{c.housingStock}</p>
                <ul className="mt-4 space-y-1.5">
                  {publishedServices.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={pseoPath(s, c)}
                        className="text-sm text-grade-400 underline decoration-grade-600 hover:text-water-300"
                      >
                        {s.shortName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <Link href="/areas-we-serve/" className="cta-secondary mt-10">
            All service areas
          </Link>
        </div>
      </section>

      <ServiceAreaBand />

      {/* ── WHAT TO EXPECT ──────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <figure className="mb-12">
          <SmartImage
            name={pageImages.inspection.name}
            alt={pageImages.inspection.alt}
            sizes="(min-width: 1152px) 1088px, 100vw"
            aspect="16 / 7"
            className="aspect-[16/7] w-full object-cover object-[50%_35%]"
          />
          <figcaption className="mt-3 spec text-xs leading-relaxed text-grade-600">
            {pageImages.inspection.caption}
          </figcaption>
        </figure>
        <WhatToExpect />
        <div className="mt-10">
          <TrustBadges />
        </div>
        <div className="mt-8">
          <AssociationLogos />
        </div>
        </div>
      </section>

      {/* ── GUARANTEE ───────────────────────────────────────────────────── */}
      <section className="border-y border-limestone-200 bg-limestone-100">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid items-start gap-10 sm:grid-cols-[minmax(0,180px)_1fr] sm:gap-12">
            <GuaranteeSeal className="mx-auto max-w-[180px]" />
            <div>
              <p className="eyebrow">Our promise</p>
              <h2 className="mt-2 text-3xl">We stand behind the scope we wrote</h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-grade-800">
                Every job is quoted from a written scope, and that document is what we are held to.
                If the finished work does not match it, we come back and make it match — no
                argument about what was implied on the day.
              </p>

              <p className="mt-6 font-display text-sm font-extrabold uppercase tracking-[0.1em] text-grade-900">
                What the written scope covers
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {guaranteeCovers.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[0.9375rem] text-grade-800">
                    <Icon name="check" className="mt-1 h-4 w-4 text-water-500" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/services/"
                className="cta-primary mt-8 w-full"
              >
                See how we work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ─────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reviews reviews={reviews.slice(0, 3)} variant="grid" />
        </div>
      </section>

      {/* ── GUIDES ──────────────────────────────────────────────────────── */}
      <section className="border-t border-limestone-200 bg-limestone-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Guides</p>
        <h2 className="mt-2 text-3xl uppercase tracking-tight sm:text-4xl">
          What we find under Middle Tennessee houses
        </h2>
        <ul className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {allArticles()
            .slice(0, 4)
            .map((a) => {
              const lead = cardImage(a);
              return (
                <li key={a.slug} className="flex flex-col border border-limestone-300 bg-white">
                  {lead && (
                    <Link href={`/blog/${a.slug}/`} className="block">
                      <SmartImage
                        name={lead.slot}
                        alt={lead.alt}
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        aspect="16 / 10"
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </Link>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="spec text-[0.6875rem] uppercase tracking-[0.14em] text-water-700">
                      {a.cluster}
                    </p>
                    <h3 className="mt-2 font-display text-base font-extrabold leading-snug">
                      <Link href={`/blog/${a.slug}/`} className="hover:text-water-700">
                        {a.title}
                      </Link>
                    </h3>
                    <p className="mt-auto pt-3 spec text-xs text-grade-600">
                      {a.readingMinutes} min read
                    </p>
                  </div>
                </li>
              );
            })}
        </ul>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-limestone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <Faq faqs={homeFaqs} />
        </div>
      </section>
    </>
  );
}
