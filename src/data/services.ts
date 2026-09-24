import type { City } from './cities';

/**
 * SERVICES (the "head term" half of the pSEO matrix)
 *
 * `faqsFor(city)` is a function, not a template string, on purpose. It reads
 * the city's real geology/drainage/code data and composes answers from it, so
 * two pages differ because the underlying facts differ — not because a token
 * got swapped. Token-swapped FAQs are the fastest way to get a page classed
 * as thin.
 */

export type Service = {
  slug: string;
  name: string;
  /** Short form for breadcrumbs and nav. */
  shortName: string;
  status: 'published' | 'draft';
  /** One-sentence summary used in meta descriptions and cards. */
  blurb: string;
  /** What the homeowner is actually experiencing. */
  symptoms: string[];
  /** Ordered work sequence. Genuine sequence, so numbering is meaningful. */
  process: { title: string; detail: string }[];
  /** Semantic / LSI terms to work into copy naturally. Not for stuffing. */
  semanticTerms: string[];
  /** Typical range. Keep honest and wide, or leave null. */
  priceGuide: string | null;
  timeline: string;
  /**
   * The one paragraph that exists only for this service × this city.
   *
   * This is the field that makes uniqueness scale with the matrix rather than
   * with the city list. Without it, two service pages for the same town share
   * their whole local section and overlap ~65% — measure it yourself with
   * `npm run overlap`. Written per combination, on purpose.
   */
  localLens: (city: City) => string;
  faqsFor: (city: City) => { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: 'basement-waterproofing',
    name: 'Basement Waterproofing',
    shortName: 'Basement Waterproofing',
    status: 'published',
    blurb:
      'Diagnose where water is actually entering, intercept it before it reaches the wall, and manage what gets through with drainage sized to the real load.',
    symptoms: [
      'Water at the joint where the floor meets the wall after heavy rain',
      'White chalky efflorescence or dark staining low on block walls',
      'A musty smell that returns every spring no matter how much you ventilate',
      'Flooring cupping, baseboards swelling or drywall wicking in a finished basement',
      'Standing water that takes days to disappear',
      'Horizontal cracking with inward bowing on a below-grade wall',
    ],
    process: [
      {
        title: 'Diagnose the water path',
        detail:
          'Storm-driven lateral flow, a genuine groundwater table and plumbing failure all look identical once the floor is wet, and each has a different fix. We establish which one you have — timing relative to rainfall, which walls are affected, moisture readings, exterior grade and discharge survey — before proposing anything.',
      },
      {
        title: 'Correct the water arriving',
        detail:
          'The cheapest cubic foot of water to manage is the one that never reaches the foundation. Gutter capacity, downspout discharge distance, negative grade and settled backfill account for a large share of the calls we take. This step is unglamorous and frequently the entire solution.',
      },
      {
        title: 'Intercept what the site keeps sending',
        detail:
          'Where a defined uphill contributing area is loading one wall, an exterior curtain or French drain upslope removes the load rather than managing its consequences. On sites without that option, interior perimeter drainage takes over.',
      },
      {
        title: 'Install drainage and pump capacity',
        detail:
          'Perimeter drain to a sealed basin, pump sized to measured inflow rather than a default, sealed lid to keep humidity and radon out of the space, and a backup pump wherever a power outage would mean a flooded room.',
      },
      {
        title: 'Verify under load',
        detail:
          'A system that has not been tested is an assumption. We run water against the corrected system, confirm discharge goes where it is supposed to, and walk the outfall with you so you know what to watch.',
      },
    ],
    semanticTerms: [
      'hydrostatic pressure',
      'perimeter drain tile',
      'sump pump basin',
      'vapour barrier',
      'efflorescence',
      'negative grade',
      'exterior curtain drain',
      'cold joint seepage',
      'licensed contractor',
      'transferable warranty',
      'structural integrity',
      'property value',
      'relative humidity',
      'discharge outfall',
    ],
    // Null until a range is defensible across enough completed jobs to be
    // honest. Nothing renders while it is null, which is the intended state
    // for a service that is priced only after an on-site diagnosis.
    priceGuide: null,
    timeline: 'Most residential systems are completed in one to three days.',
    localLens: (city) =>
      ({
        nashville:
          'For waterproofing specifically, the Nashville pattern to understand is timing. Storm-driven lateral flow arrives fast and leaves, which means the wrong diagnosis here is a pump upgrade — a bigger pump moves water that should never have reached the wall. On Davidson County lots we spend most of the inspection on the exterior: roof capture, discharge distance, and where the grade sends water once it hits rock.',
        brentwood:
          'For waterproofing on a Brentwood lot, the variable that decides the design is which wall is uphill. These houses are cut into slopes, so the load is concentrated and sustained rather than spread and brief — genuine hydrostatic pressure on one elevation. That makes exterior interception unusually cost-effective here, and it is why we measure the contributing area above the house before pricing anything.',
        franklin:
          'For waterproofing in Franklin the first question is the age of the foundation, because it changes what is even permissible. On a 19th-century rubble or soft-brick wall downtown, the standard interior coating is actively harmful and the work becomes water management plus appropriate repointing. On a 2010s Westhaven or Cool Springs foundation the same symptom is usually settled backfill and a downspout, which is a grading job rather than a waterproofing job.',
        hendersonville:
          'For waterproofing near Old Hickory Lake, the design has to assume standing water rather than storm pulses. When the lake pool governs your water table, the load is present for months, which moves the emphasis onto interior perimeter drainage, correctly sized pump capacity and a backup — and away from the surface interception that solves most inland Nashville jobs.',
      })[city.slug] ??
      `In ${city.name} we design around the water path we find on site rather than a standard package.`,
    faqsFor: (city) => [
      {
        q: `How much does basement waterproofing cost in ${city.name}?`,
        a: `Cost tracks the scope the site actually requires, and in ${city.name} the range is wide because the underlying conditions vary so much. A regrading-and-discharge correction is a fraction of the cost of interior perimeter drainage with a pump, and an exterior excavation on a sloped ${city.county} lot with limited equipment access sits higher again. We quote after inspection rather than over the phone, because quoting a full system to someone who needs a downspout extension is how this industry earned its reputation.`,
      },
      {
        q: `Do I need a permit to waterproof a basement in ${city.name}?`,
        a: `${city.local.codes.split('. ').slice(0, 2).join('. ')}. Confirm the specifics for your address with ${city.local.authority.name}${city.local.authority.phone ? ` at ${city.local.authority.phone}` : ''} — we handle permitting where the work requires it.`,
      },
      {
        q: `Is interior or exterior waterproofing better for a ${city.name} home?`,
        a: `Neither is universally better; they solve different problems. Exterior work stops water reaching the wall and is the stronger choice where a defined uphill area is loading one side of the house — a common pattern given ${city.name}'s terrain. Interior drainage manages water that the site will keep producing regardless, which is the right call for a genuine water table. The diagnosis determines the answer, and any contractor who recommends the same approach on every house is selling a product rather than solving a problem.`,
      },
      {
        q: `How long does the work take, and will my ${city.name} home be liveable during it?`,
        a: `${'Most residential systems are completed in one to three days.'} Interior drainage is dusty and loud while the floor edge is open, and you will want to clear a working perimeter, but the house stays liveable. Exterior excavation is less disruptive indoors and more disruptive outdoors — expect equipment on the lot and landscaping in the work path to be affected.`,
      },
    ],
  },

  {
    slug: 'crawl-space-encapsulation',
    name: 'Crawl Space Encapsulation',
    shortName: 'Crawl Space Encapsulation',
    status: 'published',
    blurb:
      'Seal the crawl space from ground moisture and outside air, control humidity mechanically, and stop the space from feeding damp air into the house above.',
    symptoms: [
      'Musty smell in the rooms above, strongest in summer',
      'Standing water or mud on the crawl space floor',
      'Sagging or spongy floors above the crawl space',
      'Visible mould or white fungal growth on joists and subfloor',
      'Cold floors in winter and high humidity upstairs in summer',
      'Rising energy bills with no change in usage',
    ],
    process: [
      {
        title: 'Assess moisture source and structure',
        detail:
          'Ground moisture, bulk water intrusion, plumbing leaks and outside humidity condensing on cool surfaces produce similar damage. We measure wood moisture content and relative humidity, and inspect joists, sills and piers for existing rot before sealing anything in.',
      },
      {
        title: 'Remove debris and standing water',
        detail:
          'Old fibreglass insulation holding moisture against the subfloor, construction debris and existing failed liner come out. Where there is bulk water, drainage and a pump go in first — encapsulating over standing water traps the problem instead of solving it.',
      },
      {
        title: 'Install the vapour barrier',
        detail:
          'Reinforced liner across the floor and up the piers and walls, seams sealed, mechanically fastened and terminated below the sill. Coverage and detailing at penetrations are what separate an encapsulation from a plastic sheet on dirt.',
      },
      {
        title: 'Seal and condition the space',
        detail:
          'Vents and rim joist penetrations sealed, then a dedicated dehumidifier with a condensate route so the space holds a stable humidity year-round. A sealed crawl space without humidity control can be worse than a vented one.',
      },
      {
        title: 'Verify humidity over a full cycle',
        detail:
          'We set a target, confirm the space holds it, and show you how to read the monitor. Encapsulation is a system that runs, not a one-off installation.',
      },
    ],
    semanticTerms: [
      'reinforced vapour barrier',
      'relative humidity control',
      'crawl space dehumidifier',
      'rim joist air sealing',
      'stack effect',
      'wood moisture content',
      'fungal growth',
      'radon',
      'conditioned crawl space',
      'indoor air quality',
      'structural integrity',
      'licensed contractor',
    ],
    priceGuide: null,
    timeline: 'Typical crawl spaces are completed in two to four days.',
    localLens: (city) =>
      ({
        nashville:
          'Crawl space work is arguably the more common Nashville job of the two, precisely because the limestone made full basements uneconomical to dig. A large share of Davidson County houses have a vented crawl space that was never designed to stay dry, and the same lateral flow that soaks basements elsewhere arrives here as standing water on bare soil under the floor.',
        brentwood:
          'Brentwood crawl spaces are usually the smaller portion of a house that is mostly finished basement — a stepped foundation where one section stayed unexcavated. Those transitions are where we find the worst humidity, because the crawl portion vents to outside air while sitting directly against conditioned space, and the resulting condensation lands on the joists rather than the ground.',
        franklin:
          'In Franklin the crawl spaces worth inspecting first are the historic ones. A 19th-century house downtown often has a shallow crawl over bare earth inside masonry perimeter walls, with almost no clearance to work in and sills that have been damp for a century. Encapsulating those requires checking the sill and joist condition before anything gets sealed in, because rot found afterwards is far more expensive to reach.',
        hendersonville:
          'Near Old Hickory Lake, crawl space humidity tracks the lake season rather than the weather. A space that reads a comfortable 55 percent relative humidity in February can sit above 75 percent through June, which is the range where fungal growth on joists becomes active. That seasonal swing is why a sealed crawl space here needs mechanical dehumidification rather than just a good liner.',
      })[city.slug] ??
      `In ${city.name} we measure humidity and wood moisture before recommending encapsulation.`,
    faqsFor: (city) => [
      {
        q: `Why is crawl space work so common in ${city.name}?`,
        a: `Because of what is under the ground. ${city.local.geology.split('. ').slice(0, 2).join('. ')}. Shallow rock made full basements expensive to excavate, so builders across ${city.county} favoured crawl spaces — which means a large share of "wet basement" calls here are really crawl space moisture problems with different symptoms and a different remedy.`,
      },
      {
        q: `Will encapsulating my crawl space actually improve the air in the house?`,
        a: `It usually does, and the mechanism is worth understanding. Air moves upward through a house — the stack effect — so a meaningful fraction of what you breathe on the main floor of a ${city.name} home entered through the crawl space. Damp crawl space air carries mould spores and musty odour compounds up with it. Sealing the ground and controlling humidity changes the quality of the air entering, not just the condition of the crawl space.`,
      },
      {
        q: `Should I insulate the crawl space walls too?`,
        a: `Usually yes, once it is sealed and dry, and in that order. Insulation belongs on the perimeter walls of a sealed crawl space rather than stapled between the floor joists, where the older approach traps moisture against the subfloor. Doing this while the space is still damp is a common and expensive mistake — insulation installed over a moisture problem hides it while the joists keep deteriorating.`,
      },
      {
        q: `Do I need a permit for crawl space encapsulation in ${city.name}?`,
        a: `Encapsulation is generally treated as repair rather than construction, so a building permit is typically not required. Structural work found along the way — sistering joists, replacing a rotted sill, adding piers — is a different matter. ${city.local.authority.name} is the authority for your area${city.local.authority.phone ? ` (${city.local.authority.phone})` : ''}, and we confirm before starting.`,
      },
    ],
  },

  /* ── DRAFTS: no routes, no sitemap entries, until content is written ── */
  ...(
    [
      ['foundation-crack-repair', 'Foundation Crack Repair'],
      ['sump-pump-installation', 'Sump Pump Installation'],
      ['exterior-french-drain', 'Exterior French Drain Installation'],
      ['basement-wall-repair', 'Bowing Basement Wall Repair'],
    ] as const
  ).map(
    ([slug, name]): Service => ({
      slug,
      name,
      shortName: name,
      status: 'draft',
      blurb: '',
      symptoms: [],
      process: [],
      semanticTerms: [],
      priceGuide: null,
      timeline: '',
      localLens: () => '',
      faqsFor: () => [],
    }),
  ),
];

export const publishedServices = services.filter((s) => s.status === 'published');

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
