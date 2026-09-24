/**
 * SITE IMAGERY
 *
 * Reference photography used on the marketing pages, keyed by the manifest
 * name that `npm run images` generates from assets/images-src/<name>.jpg.
 *
 * ── WHY THE CAPTIONS SAY WHAT THEY SAY ──────────────────────────────────
 * These are licensed stock photographs of the conditions and methods the
 * copy describes, not photographs of our own jobs. Every caption and alt
 * string below therefore describes the assembly in the frame; none of them
 * claims a specific customer, address or completion date. When real job
 * photography exists, drop it into assets/images-src/ under the same name
 * and the captions can tighten up accordingly — nothing else has to change.
 */

export type SiteImage = {
  /** Manifest key, i.e. the source filename without its extension. */
  name: string;
  /** Descriptive alt text. Describes the frame, never keyword-stuffed. */
  alt: string;
  /** Short caption shown beneath the image where the layout allows one. */
  caption: string;
};

/** Reference photography per service, in the order it reads best. */
export const workImagery: Record<string, SiteImage[]> = {
  'basement-waterproofing': [
    {
      name: 'work-drainage-trench',
      alt: 'Perforated drainage pipe bedded in washed gravel along the bottom of an open trench',
      caption: 'Perforated pipe bedded in washed stone. The gravel is the drain; the pipe only carries what the gravel collects.',
    },
    {
      name: 'work-basement-interior',
      alt: 'Unfinished basement with concrete block walls, a stem wall ledge and exposed floor joists',
      caption: 'The joint between block wall and footing — the entry point on most storm-driven leaks.',
    },
    {
      name: 'work-foundation-excavation',
      alt: 'Compact excavator working alongside the foundation of a house under construction',
      caption: 'Exterior work means excavating to the footing. Access and spoil storage decide what a job costs.',
    },
    {
      name: 'work-footing-pour',
      alt: 'Concrete being placed into an excavated footing trench with reinforcing bar stacked alongside',
      caption: 'A footing pour. Everything a waterproofing system does happens against this line.',
    },
    {
      name: 'work-roof-runoff',
      alt: 'Rainwater running out of a house gutter at the roof edge during a storm',
      caption: 'Roof water is the volume nobody counts. Discharge distance is usually the cheapest fix on the list.',
    },
    {
      name: 'work-water-staining',
      alt: 'Below-grade masonry showing dark water staining and mineral streaking from long-term moisture',
      caption: 'Staining and efflorescence read as a history: where water arrived, and how often.',
    },
  ],

  'crawl-space-encapsulation': [
    {
      name: 'work-crawl-space-access',
      alt: 'Inspector opening the exterior access hatch to a crawl space beside a shingled house wall',
      caption: 'Every diagnosis starts at the access door, not on the phone.',
    },
    {
      name: 'work-underfloor-space',
      alt: 'Under-floor space with block walls, exposed joists, ductwork and a water heater',
      caption: 'Ducts, plumbing and joists share the space. Whatever the air here holds, the house above breathes.',
    },
    {
      name: 'work-sealing-seam',
      alt: 'Gloved hand running a bead of sealant along a framing joint',
      caption: 'Sealed penetrations are most of the labour in an encapsulation, and the part quotes leave vague.',
    },
    {
      name: 'work-insulation-batts',
      alt: 'Worker fitting fibreglass batt insulation between wall studs',
      caption: 'Insulation belongs on the perimeter wall of a sealed space — and only once the space is dry.',
    },
    {
      name: 'work-subfloor-framing',
      alt: 'Subfloor and floor joists of a house under construction, seen from inside the framed shell',
      caption: 'The subfloor from above. From below it is the surface that absorbs whatever the ground gives off.',
    },
    {
      name: 'work-framing-interior',
      alt: 'Interior of a timber-framed house under construction with sheathed walls and open joists',
      caption: 'Framing, before anything is closed in. This is the only easy time to see the whole assembly.',
    },
  ],
};

/**
 * Pick `count` reference photographs for a service page.
 *
 * `offset` rotates the selection so the four city pages for one service do
 * not all open with the same frame. Wraps, so any offset is safe.
 */
export function workImagesFor(serviceSlug: string, offset = 0, count = 3): SiteImage[] {
  const pool = workImagery[serviceSlug] ?? [];
  if (pool.length === 0) return [];
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => {
    const image = pool[(offset + i) % pool.length];
    return image;
  });
}

/** The lead photograph for a service, used on the homepage and /services/. */
export function leadImageFor(serviceSlug: string): SiteImage | undefined {
  return workImagery[serviceSlug]?.[0];
}

/** One-off photographs used on individual pages. */
export const pageImages = {
  inspection: {
    name: 'site-inspection',
    alt: 'Inspector in a high-visibility vest kneeling in a doorway making notes on a clipboard',
    caption: 'The free visit ends with a written scope, whether or not you hire us.',
  },
  nashvilleSkyline: {
    name: 'site-nashville-skyline',
    alt: 'Downtown Nashville skyline and the pedestrian bridge reflected in the Cumberland River',
    caption: 'The Cumberland and its tributaries set the drainage pattern for the whole metro.',
  },
  consultation: {
    name: 'site-consultation',
    alt: 'Two homeowners in hard hats walking a bare concrete interior with a contractor holding a folder',
    caption: 'We walk the outside, then the inside, then write down what we found.',
  },
  brickHome: {
    name: 'site-brick-home',
    alt: 'Two-storey brick house with a stone foundation course and gabled dormers',
    caption: 'Brick over a masonry foundation course — the dominant housing stock across Middle Tennessee.',
  },
} satisfies Record<string, SiteImage>;
