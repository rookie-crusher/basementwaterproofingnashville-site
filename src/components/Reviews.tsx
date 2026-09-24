import Link from 'next/link';
import { type Review, type ReviewSource, isSelfServing } from '@/data/reviews';
import { site } from '@/data/site';

/**
 * REVIEW COMPONENT
 *
 * Displays real reviews from src/data/reviews.ts. Display and schema are
 * deliberately decoupled: everything here is shown to visitors, while
 * reviewSchema() in lib/schema.ts emits markup only for third-party reviews.
 * See the header comment in src/data/reviews.ts for why.
 */

const SOURCE_LABEL: Record<ReviewSource, string> = {
  FirstParty: 'Submitted on basementwaterproofingnashville.com',
  Google: 'Google',
  Facebook: 'Facebook',
  BBB: 'Better Business Bureau',
  Angi: 'Angi',
  Yelp: 'Yelp',
};

export function Reviews({
  reviews,
  heading,
  context,
  variant = 'grid',
}: {
  reviews: Review[];
  heading?: string;
  context?: string;
  /** 'grid' clamps long reviews; 'full' shows every word. */
  variant?: 'grid' | 'full';
}) {
  if (!reviews.length) {
    return (
      <section
        aria-labelledby="reviews-heading"
        className="border border-limestone-300 bg-limestone-50 p-6"
      >
        <p className="eyebrow">Reviews</p>
        <h2 id="reviews-heading" className="mt-2 font-display text-2xl font-bold">
          Verified reviews are being collected
        </h2>
        <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-grade-800">
          We publish reviews here as they come in, with the reviewer&rsquo;s name and where they
          were posted. Nothing on this page is written by us.
        </p>
        <Link href="/testimonials/" className="cta-secondary mt-4">
          See the reviews page
        </Link>
      </section>
    );
  }

  const anySelfServing = reviews.some(isSelfServing);

  return (
    <section aria-labelledby="reviews-heading">
      <p className="eyebrow">Reviews</p>
      <h2 id="reviews-heading" className="mt-2 font-display text-3xl font-bold">
        {heading ?? `What ${context ?? 'Middle Tennessee'} homeowners say`}
      </h2>

      <ul
        className={
          variant === 'full'
            ? 'mt-6 grid gap-px bg-limestone-300 sm:grid-cols-2'
            : 'mt-6 grid gap-px bg-limestone-300 sm:grid-cols-2 lg:grid-cols-3'
        }
      >
        {reviews.map((r) => (
          <li key={r.id} className="flex flex-col bg-limestone-50 p-5">
            <Stars rating={r.rating} />

            <blockquote
              className={
                variant === 'full'
                  ? 'mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-grade-900'
                  : 'mt-3 space-y-3 overflow-hidden text-[0.9375rem] leading-relaxed text-grade-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:8]'
              }
            >
              {r.body.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </blockquote>

            <footer className="mt-4 spec text-xs text-grade-600">
              <span className="font-semibold text-grade-900">{r.author}</span>
              {r.neighborhood && <> &middot; {r.neighborhood}</>}
              <span className="mt-0.5 block">
                {SOURCE_LABEL[r.source]}
                {r.datePublished && (
                  <>
                    {' · '}
                    <time dateTime={r.datePublished}>
                      {new Date(r.datePublished).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </>
                )}
              </span>
            </footer>
          </li>
        ))}
      </ul>

      <p className="mt-4 max-w-prose spec text-xs leading-relaxed text-grade-600">
        Shown verbatim as written by the customer. {site.brand} does not edit review text.
        {anySelfServing && ' Reviews marked as submitted on this site were left directly with us.'}
      </p>

      {variant === 'grid' && (
        <Link href="/testimonials/" className="cta-secondary mt-5">
          Read all reviews
        </Link>
      )}
    </section>
  );
}

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${i <= full ? 'text-water-500' : 'text-limestone-300'}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </div>
  );
}
