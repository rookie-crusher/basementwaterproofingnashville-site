import type { Metadata } from 'next';
import { reviews, displayAverage, eligibleForSchema } from '@/data/reviews';
import { site, reviewLink } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, reviewSchema } from '@/lib/schema';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Reviews } from '@/components/Reviews';
import { CallButton } from '@/components/CallButton';
import { LeadFormSlot } from '@/components/LeadFormSlot';

export const metadata: Metadata = buildMetadata({
  path: '/testimonials/',
  title: `Reviews | Basement Waterproofing Nashville`,
  description: `Read ${reviews.length} five-star reviews from Basement Waterproofing Nashville customers, shown verbatim. Call ${site.phone.display} for a free inspection.`,
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Reviews', path: '/testimonials/' },
];

/**
 * TESTIMONIALS
 *
 * AggregateRating lives here and only here, and only once reviews.ts holds at
 * least three real reviews (see aggregate()). Publishing aggregate rating
 * markup without the reviews behind it is a structured-data violation and the
 * fastest way to get rich results turned off for the whole domain.
 */
export default function TestimonialsPage() {
  const avg = displayAverage();
  const link = reviewLink();

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail)} />
      <JsonLd data={reviewSchema(reviews)} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumbs trail={trail} />
        <h1 className="mt-6 text-4xl sm:text-5xl">Reviews</h1>

        {avg && (
          <p className="mt-5 max-w-prose text-lg leading-relaxed text-grade-800">
            <span className="font-mono font-medium">{avg.ratingValue}</span> average across{' '}
            <span className="font-mono font-medium">{avg.reviewCount}</span> reviews, shown exactly
            as our customers wrote them. Nothing on this page is written by us.
          </p>
        )}

        <div className="mt-12">
          <Reviews reviews={reviews} heading="What our customers said" variant="full" />
        </div>

        {link && (
          <div className="mt-12 border border-limestone-300 bg-limestone-50 p-6">
            <p className="eyebrow">Worked with us?</p>
            <h2 className="mt-2 font-display text-xl font-bold">Leave a review</h2>
            <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-grade-800">
              Reviews help other Middle Tennessee homeowners work out who to call. It takes a
              minute.
            </p>
            <a href={link} className="cta-secondary mt-4" rel="noopener">
              Write a Google review
            </a>
          </div>
        )}

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl">Still deciding?</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-grade-800">
              The inspection is free and comes with a written scope, so you can take it to another
              contractor and compare. We would rather you did that than felt rushed.
            </p>
            <div className="mt-5">
              <CallButton />
            </div>
          </div>
          <LeadFormSlot heading="Request an inspection" />
        </div>
      </div>
    </>
  );
}
