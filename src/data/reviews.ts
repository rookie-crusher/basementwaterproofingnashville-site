/**
 * REVIEWS
 *
 * ── IMPORTANT: FIRST-PARTY REVIEWS AND SCHEMA ───────────────────────────
 * These reviews were collected on basementwaterproofingnashville.com — the
 * business's own website. In Google's terminology that makes them
 * "self-serving": a review about a business, hosted on a site owned or
 * controlled by that same business.
 *
 * Google's review snippet policy does not allow self-serving reviews to be
 * marked up with Review or AggregateRating for LocalBusiness or Organization.
 * Marking them up anyway risks rich results being disabled across the whole
 * domain, not just on one page.
 *
 * So this file separates two things that are easy to conflate:
 *   DISPLAY  — every review below is shown on the site. Entirely fine, and
 *              good for conversion. Real words from real customers.
 *   MARKUP   — eligibleForSchema() filters to third-party reviews only.
 *              Today that returns an empty list, so no Review or
 *              AggregateRating JSON-LD is emitted anywhere.
 *
 * To become eligible for star markup you need reviews on third-party
 * platforms — Google Business Profile above all. The practical path is asking
 * these same happy customers to re-post on Google; see reviewLink() in
 * site.ts. As those arrive, add them with the real platform in `source` and
 * the markup switches itself on with no code change.
 */

export type ReviewSource = 'FirstParty' | 'Google' | 'Facebook' | 'BBB' | 'Angi' | 'Yelp';

export type Review = {
  id: string;
  /** Reviewer name exactly as published. Never invented or tidied up. */
  author: string;
  /** 1-5 as given. */
  rating: number;
  /**
   * ISO date published. Optional because the imported reviews carried no
   * dates — omitted rather than guessed, since a fabricated date in schema is
   * a fabrication like any other.
   */
  datePublished?: string;
  /** Verbatim review text. Do not edit for grammar or length. */
  body: string;
  source: ReviewSource;
  sourceUrl?: string;
  /**
   * City the job was in. Undefined for the imported reviews because the source
   * did not record it. Fill these in from your own records and the matching
   * city page starts showing the review automatically.
   */
  citySlug?: string;
  serviceSlug?: string;
  neighborhood?: string;
};

/** Sources that are self-serving: displayable, but not markup-eligible. */
export const SELF_SERVING_SOURCES: ReviewSource[] = ['FirstParty'];

export const reviews: Review[] = [
  {
    id: 'fp-001',
    author: 'Carl Dinkelaker',
    rating: 5,
    source: 'FirstParty',
    serviceSlug: 'basement-waterproofing',
    body: 'Very satisfied with their work. They solved our basement water issue quickly and professionally.',
  },
  {
    id: 'fp-002',
    author: 'Sundarnath Das',
    rating: 5,
    source: 'FirstParty',
    serviceSlug: 'basement-waterproofing',
    body: 'Very efficient and fixed our basement water leakage problem expertly.',
  },
  {
    id: 'fp-003',
    author: 'Anna Serzo',
    rating: 5,
    source: 'FirstParty',
    body: 'These guys are absolutely excellent. I would recommend them to anybody and would definitely hire them again. Great company with a professional and friendly team.',
  },
  {
    id: 'fp-004',
    author: 'Karen Sidlauskas',
    rating: 5,
    source: 'FirstParty',
    body: 'I loved their work from the very beginning, and I will definitely hire them again. They did a great job, arrived on time, and were wonderful to work with.',
  },
  {
    id: 'fp-005',
    author: 'Norma Paiva',
    rating: 5,
    source: 'FirstParty',
    body: 'Compared to other waterproofing companies I’ve used before, BasementWaterproofingNashville.com is the best all around. I would gladly recommend them to anyone.',
  },
  {
    id: 'fp-006',
    author: 'Gary Adler',
    rating: 5,
    source: 'FirstParty',
    serviceSlug: 'basement-waterproofing',
    body: 'I needed them to come out twice because the basement leak was a bit tricky to locate and repair, and the first attempt wasn’t completely successful. There was no charge for the return visit, and everything was handled very professionally. The leak has been completely resolved.',
  },
  {
    id: 'fp-007',
    author: 'Dina Eyzaguirre',
    rating: 5,
    source: 'FirstParty',
    serviceSlug: 'basement-waterproofing',
    body: 'For people reading this in future months: our basement started leaking during the Covid-19 situation. It was such a relief to find a professional and responsive company. They inspected the issue and provided a quote within a day. Two days later, the waterproofing work was completed. Everything was handled through email, phone calls, and text messages. They even checked in afterward to make sure everything was still performing well. We’ve had several heavy rainstorms since then, and our basement has stayed completely dry. During Covid-19, their contactless service was reliable and convenient. I highly recommend them.',
  },
  {
    id: 'fp-008',
    author: 'Michael Kaplowitz',
    rating: 5,
    source: 'FirstParty',
    body: 'Highly professional and very pleasant to work with.',
  },
  {
    id: 'fp-009',
    author: 'Anthony Mannuzza',
    rating: 5,
    source: 'FirstParty',
    serviceSlug: 'basement-waterproofing',
    body: 'I usually don’t write reviews, but I felt compelled to share my experience. The team was working on a neighbor’s waterproofing project when they noticed signs of moisture intrusion along my foundation. They kindly let me know and explained how ignoring it could eventually lead to expensive structural damage.\n\nWe agreed on a very fair price, and they completed the waterproofing work with quality materials and excellent workmanship.\n\nThe team was professional, honest, and reliable throughout the entire process. It’s difficult to find contractors who truly stand behind their work. I’ve been a homeowner for over 45 years and have dealt with many contractors, so I know quality when I see it. I waited over two months before writing this review because I wanted to see how everything performed after several heavy rainstorms. I’m happy to say the basement has remained completely dry, and their warranty gives me real peace of mind.',
  },
  {
    id: 'fp-010',
    author: 'Michael Gorman',
    rating: 5,
    source: 'FirstParty',
    serviceSlug: 'basement-waterproofing',
    body: 'I’m very satisfied with the work completed by BasementWaterproofingNashville.com. I contacted them after my regular contractor went out of business, and I’m glad I did. They repaired foundation cracks, addressed water seepage, and completed the work professionally. The cleanup was excellent, the pricing was fair, and I’ll definitely use them again. I highly recommend this company.',
  },
  {
    id: 'fp-011',
    author: 'James Fleck',
    rating: 5,
    source: 'FirstParty',
    serviceSlug: 'basement-waterproofing',
    body: 'We discovered water leaking into our basement, and they were there the very next day to diagnose and fix the problem. The issue turned out to be more extensive than expected, but the crew stayed on top of everything to make sure the repair was done correctly. Everything was completed on time and within budget. I wouldn’t hesitate to use them again for any basement waterproofing needs.',
  },
  {
    id: 'fp-012',
    author: 'Cam D',
    rating: 5,
    source: 'FirstParty',
    serviceSlug: 'basement-waterproofing',
    body: 'They were very responsive from day one. They arrived exactly when promised for the inspection, even though it was raining. I received a quote the same day for waterproofing repairs around the foundation and sealing areas where water was entering the basement. The work was completed quickly, and they answered all of my follow-up questions. I would definitely recommend them and use them again.',
  },
  {
    id: 'fp-013',
    author: 'James Ryan',
    rating: 5,
    source: 'FirstParty',
    serviceSlug: 'basement-waterproofing',
    body: 'The waterproofing work completed by BasementWaterproofingNashville.com exceeded my expectations. Everyone on the team was courteous, knowledgeable, and made sure the work area was clean and safe throughout the project.\n\nThe owner kept me updated with photos during the process and explained everything clearly. If they found any additional issues that could lead to future water problems, they addressed them even when they weren’t originally included in the estimate. I truly appreciate their dedication and wouldn’t hesitate to recommend them to my friends and family.',
  },
  {
    id: 'fp-014',
    author: 'David Wayne Katz-Hackman',
    rating: 5,
    source: 'FirstParty',
    serviceSlug: 'basement-waterproofing',
    body: 'We needed to quickly resolve water intrusion in our basement, and BasementWaterproofingNashville.com was excellent. They were more responsive than any waterproofing contractor I’ve worked with before. The crew arrived on time, worked efficiently, and completed everything exactly as promised. They will absolutely be my first call if I ever need waterproofing services again.',
  },
  {
    id: 'fp-015',
    author: 'Paul Liguori',
    rating: 5,
    source: 'FirstParty',
    body: 'I can’t say enough about the crew. Prompt, courteous, and hardworking. I’ll definitely use them again whenever needed and would gladly recommend BasementWaterproofingNashville.com to anyone looking for dependable waterproofing services.',
  },
];

export function hasReviews(): boolean {
  return reviews.length > 0;
}

export function isSelfServing(r: Review): boolean {
  return SELF_SERVING_SOURCES.includes(r.source);
}

/**
 * The subset that may appear in Review / AggregateRating JSON-LD. Excludes
 * self-serving reviews per Google's review snippet policy. Returns [] today,
 * so the schema builders emit no review markup at all.
 */
export function eligibleForSchema(): Review[] {
  return reviews.filter((r) => !isSelfServing(r));
}

/** AggregateRating from schema-eligible reviews only, or null. */
export function aggregate(): { ratingValue: string; reviewCount: number } | null {
  const MIN = 3;
  const eligible = eligibleForSchema();
  if (eligible.length < MIN) return null;
  const sum = eligible.reduce((t, r) => t + r.rating, 0);
  return { ratingValue: (sum / eligible.length).toFixed(1), reviewCount: eligible.length };
}

/** Display-only average across every review, for on-page text. Not schema. */
export function displayAverage(): { ratingValue: string; reviewCount: number } | null {
  if (!reviews.length) return null;
  const sum = reviews.reduce((t, r) => t + r.rating, 0);
  return { ratingValue: (sum / reviews.length).toFixed(1), reviewCount: reviews.length };
}

/**
 * Most relevant reviews to DISPLAY on a programmatic page.
 * Priority: same city + same service > same city > same service > newest.
 */
export function reviewsFor(citySlug: string, serviceSlug: string, limit = 3): Review[] {
  const score = (r: Review) => {
    let s = 0;
    if (r.citySlug === citySlug) s += 2;
    if (r.serviceSlug === serviceSlug) s += 1;
    return s;
  };
  const time = (r: Review) => (r.datePublished ? Date.parse(r.datePublished) : 0);
  return [...reviews].sort((a, b) => score(b) - score(a) || time(b) - time(a)).slice(0, limit);
}
