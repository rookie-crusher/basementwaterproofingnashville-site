/**
 * CITIES (the "modifier" half of the pSEO matrix)
 *
 * ── READ THIS BEFORE ADDING A CITY ──────────────────────────────────────
 * A city only gets `status: 'published'` once the `local` block below is
 * genuinely written for that market. Slot-filling a template with a new
 * city name produces a doorway page, which is what Google's spam policy
 * targets — and what causes "Crawled – currently not indexed" to spread
 * across a whole site rather than just the thin pages.
 *
 * scripts/validate-data.mjs FAILS THE BUILD if a published city has thin
 * or duplicated local content. That guardrail is deliberate. Raise the
 * thresholds rather than lowering them.
 *
 * Workflow for a new city: add it as 'draft' → write the local blocks →
 * flip to 'published' → rebuild. The sitemap and routes follow automatically.
 */

export type CodeAuthority = {
  name: string;
  phone?: string;
  url: string;
  /** What this authority actually requires for our kind of work. */
  note: string;
};

export type City = {
  slug: string;
  name: string;
  county: string;
  state: string;
  stateAbbr: string;
  zips: string[];
  geo: { latitude: number; longitude: number };
  driveTime: string;
  status: 'published' | 'draft';
  neighborhoods: string[];
  landmarks: string[];
  waterways: string[];
  /** One line on the dominant foundation type here. Drives copy + service mix. */
  housingStock: string;
  local: {
    /** What's under the ground here, and why it matters. */
    geology: string;
    /** How water actually reaches foundations in this specific city. */
    drainage: string;
    /** Permitting and code reality for this jurisdiction. */
    codes: string;
    authority: CodeAuthority;
  };
  /** City-specific Q&As. Combined with per-service questions at render time. */
  faqs: { q: string; a: string }[];
};

export const cities: City[] = [
  {
    slug: 'nashville',
    name: 'Nashville',
    county: 'Davidson County',
    state: 'Tennessee',
    stateAbbr: 'tn',
    zips: ['37206', '37207', '37209', '37211', '37212', '37214', '37215', '37216', '37221'],
    geo: { latitude: 36.1627, longitude: -86.7816 },
    driveTime: 'Same-day service across Davidson County',
    status: 'published',
    neighborhoods: [
      'East Nashville',
      'Donelson',
      'Bellevue',
      'Sylvan Park',
      'Green Hills',
      'Inglewood',
      'Madison',
      'Hermitage',
      'Antioch',
      '12 South',
    ],
    landmarks: ['Shelby Bottoms Greenway', 'Radnor Lake', 'Percy Warner Park', 'Cumberland River'],
    waterways: ['Cumberland River', 'Mill Creek', 'Richland Creek', 'Browns Creek', 'Whites Creek'],
    housingStock:
      'Mostly crawl spaces and walk-out (daylight) basements rather than full below-grade basements, plus pre-1950 brick and block foundations across the older streetcar neighborhoods.',
    local: {
      geology:
        'Nashville sits in the Central Basin on Ordovician limestone that often begins just inches to a few feet below the topsoil. That shallow bedrock is the single fact that shapes water problems here. It is why full 8-to-10-foot basements are comparatively rare in Davidson County and why so many homes have crawl spaces or basements cut into a slope instead. The same limestone is soluble, so Davidson County is genuinely karst terrain — the U.S. Geological Survey treats the Nashville area as a sinkhole hotspot, and the corridor along Old Hickory Boulevard through Antioch has long-recognised active karst. For a homeowner this cuts two ways. Shallow rock means far less of the deep expansive-clay heave that plagues Texas or Colorado. But it also means voids, solution channels and fractures that move water sideways in ways that do not show up on a soil survey.',
      drainage:
        'Because the limestone contact is effectively impermeable compared with the thin soil above it, a heavy Middle Tennessee downpour does not soak straight down. Water saturates the topsoil, reaches the rock, and then runs horizontally along that contact until it meets something — frequently a foundation wall or a crawl space vent. This is why so many Nashville basements are dry for months and then take on water within twenty minutes of a storm starting, and why grading and gutter discharge matter more here than sump capacity alone. Neighborhoods that sit at the bottom of a grade collect the runoff from everything uphill. Along the Cumberland in East Nashville and Donelson, and along the Harpeth in Bellevue, the May 2010 flood is still the reference event: houses that had never taken water discovered where their below-grade weak points were.',
      codes:
        'Two Metro departments matter for this work. The Department of Codes and Building Safety issues building permits, and Metro Water Services Development Services handles grading and floodplain review. Interior work — a perimeter drain channel, a sump basin, sealing and encapsulation — generally falls under maintenance and repair and does not pull a building permit. It changes once the job becomes structural (underpinning, replacing supporting walls, altering load-bearing framing) or once it disturbs enough ground: a grading permit is required for land-disturbing activity over 10,000 square feet, which exterior excavation on a large lot can reach. Floodplain rules in Nashville are stricter than the FEMA minimum — Metro stormwater regulations require the lowest finished floor of a residential structure in the floodplain to sit four feet above the 1-percent-annual-chance flood elevation, not one. Metro also follows the 2018 residential code, which requires the top of an exterior foundation to stand at least 12 inches plus 2 percent above the street gutter at the point of discharge.',
      authority: {
        name: 'Metro Nashville Department of Codes and Building Safety',
        phone: '615-862-6500',
        url: 'https://www.nashville.gov/departments/codes/construction-and-permits',
        note: 'Grading and floodplain questions go to Metro Water Services Development Services at 615-862-7225.',
      },
    },
    faqs: [
      {
        q: 'Why does my Nashville basement flood only during heavy rain and stay dry the rest of the year?',
        a: 'That pattern is close to diagnostic in Davidson County. Shallow limestone stops rainwater from percolating downward, so it travels sideways along the soil-rock contact and arrives at your wall as a fast pulse rather than a slow rise. A rising groundwater table would wet the floor gradually over days. Lateral storm flow shows up as seepage at the wall-floor joint within an hour of the rain starting and drains away afterwards. The fix is usually interception and grading rather than a bigger pump.',
      },
      {
        q: 'Is my home in a Nashville sinkhole area, and does that change the waterproofing plan?',
        a: 'Davidson County is karst throughout, with recognised activity along the Old Hickory Boulevard corridor, Antioch and parts of Bellevue. It matters for waterproofing because you cannot assume a downspout extension or a drain discharge point is safe to dump volume into — concentrating water in a karst recharge zone is how a slow void becomes a fast one. On these lots we route discharge to a controlled outlet well away from the structure and avoid infiltration pits. If there is visible subsidence, stair-step cracking in brick or a depression that holds water, that is a geotechnical question before it is a waterproofing one.',
      },
      {
        q: 'Do most Nashville homes even have basements?',
        a: 'Fewer than people expect. Excavating a full basement out of Middle Tennessee limestone is expensive enough that builders here have historically preferred crawl spaces or basements daylighted into a slope. Practically, that means a lot of "wet basement" calls in Nashville are really crawl space moisture problems — standing water on a vapour barrier, humidity above 60 percent, musty air moving up into the house through the stack effect. The diagnosis and the remedy are different, so we inspect before quoting.',
      },
      {
        q: 'How does the 2010 flood affect what I need to do now?',
        a: 'If your property is in the mapped floodplain, Metro requires new residential finished floors to sit four feet above the 1-percent-annual-chance elevation — a stricter standard than the federal minimum, adopted after 2010. That governs construction rather than repairs, but it tells you how Metro views flood risk. For an existing home in those areas, the realistic goal is managing groundwater and stormwater, plus backflow protection, not making a below-grade space watertight against river flooding.',
      },
    ],
  },

  {
    slug: 'brentwood',
    name: 'Brentwood',
    county: 'Williamson County',
    state: 'Tennessee',
    stateAbbr: 'tn',
    zips: ['37027'],
    geo: { latitude: 36.0331, longitude: -86.7828 },
    driveTime: '20 minutes from central Nashville',
    status: 'published',
    neighborhoods: [
      'Maryland Farms',
      'Concord Road corridor',
      'Raintree Forest',
      'Brentmeade',
      'Governors Club',
      'Annandale',
      'Windsor Green',
    ],
    landmarks: ['Crockett Park', 'Deerwood Arboretum', 'Little Harpeth River', 'Radnor Lake'],
    waterways: ['Little Harpeth River', 'Sevenmile Creek', 'Mill Creek headwaters'],
    housingStock:
      'Large 1980s–2000s homes on sloped one-acre-plus lots, with finished daylight basements far more common here than in Davidson County.',
    local: {
      geology:
        'Brentwood sits where the Central Basin starts climbing toward the Highland Rim, and the terrain shows it — the rolling hills that make the lots desirable are also what put water against foundations. Parts of Brentwood, particularly near the Old Hickory Boulevard corridor, are mapped as active karst, so the same solution channels and voids found across Davidson County are present here with more topographic relief on top of them. The practical difference from flatter Nashville neighborhoods is head pressure. A house cut into a hillside has a tall uphill wall retaining saturated soil, and every foot of standing water against that wall is real hydrostatic load. Where Nashville problems tend to be lateral storm flow, Brentwood problems are more often sustained pressure on one specific wall.',
      drainage:
        'The signature Brentwood failure is a daylight basement where the uphill side leaks and the downhill side is bone dry. Runoff from the slope above reaches the impermeable rock layer, perches, and loads the back wall while the front of the house drains freely. Because these are large lots, the contributing area uphill can be substantial, and the original builder backfill — often the same clay-heavy spoil that came out of the hole — holds water against the wall instead of letting it drain. The stakes are higher than in an unfinished space: most of these basements are finished living area, so the first symptom an owner sees is often ruined flooring or drywall wicking, not visible water. Exterior interception uphill of the structure usually does more here than anything installed inside.',
      codes:
        'Brentwood is not under Metro Nashville. The City of Brentwood has its own building and codes department, and Williamson County governs work outside city limits, so the permitting path is different from a job ten minutes north. Two Brentwood-specific constraints come up repeatedly. First, many of these large lots use septic systems, and you cannot discharge a new drainage line where it will saturate a drain field or its reserve area — that turns a waterproofing job into a septic failure. Second, tree protection and grading rules on Brentwood lots affect exterior excavation more than owners expect, particularly where mature hardwoods sit inside the work zone. Confirm the requirements for your specific address before excavation is scheduled.',
      authority: {
        name: 'City of Brentwood Codes and Building Inspection',
        phone: '615-371-0080',
        url: 'https://www.brentwoodtn.gov',
        note: 'Properties outside city limits are permitted through Williamson County. Septic-served lots may also need Tennessee Department of Environment and Conservation review.',
      },
    },
    faqs: [
      {
        q: 'Why does only the back wall of my Brentwood basement leak?',
        a: 'Because that is the uphill wall. Water moving down the slope hits shallow rock, perches above it, and loads the retaining side of your foundation while the daylighted side drains away freely. A one-sided leak is useful information — it means the problem is a defined contributing area you can intercept uphill, rather than a general groundwater condition. Interior drainage will manage the water that gets in; an exterior curtain drain upslope stops it arriving.',
      },
      {
        q: 'I have a finished basement. Can this be fixed without tearing out the finished space?',
        a: 'Often, yes, and that is the main reason we push exterior solutions harder in Brentwood than elsewhere. Interior perimeter drainage requires opening the floor edge and the bottom of the wall finishes. Working from outside — regrading, a curtain drain uphill, corrected downspout discharge, sometimes exterior membrane on the problem wall — leaves the interior intact. It costs more per foot and needs equipment access around the house, but on a finished walkout the total cost of ownership is usually lower.',
      },
      {
        q: 'My Brentwood lot is on septic. Does that limit drainage options?',
        a: 'It limits where water can go, which is the part people miss. A new drain line cannot discharge into or upslope of a drain field or its reserve area, and additional water there can push a functioning system into failure. On septic lots we locate the field and reserve before designing the discharge route, and daylight the outlet to a controlled point downhill of both. On larger lots that sometimes means a longer run than expected, which is worth knowing before you compare quotes.',
      },
      {
        q: 'Are sinkholes a real concern in Brentwood?',
        a: 'Parts of Brentwood are in mapped active karst, so yes, with the same caveat that applies across Middle Tennessee: karst is common and most homes on it are fine. What matters for drainage work is not panicking about sinkholes but avoiding the specific mistake of concentrating collected stormwater into a recharge feature. If your lot has a depression that swallows water after storms, that is a feature to route around, not to drain into.',
      },
    ],
  },

  {
    slug: 'franklin',
    name: 'Franklin',
    county: 'Williamson County',
    state: 'Tennessee',
    stateAbbr: 'tn',
    zips: ['37064', '37067', '37069'],
    geo: { latitude: 35.9251, longitude: -86.8689 },
    driveTime: '30 minutes from central Nashville',
    status: 'published',
    neighborhoods: [
      'Historic Downtown Franklin',
      'Cool Springs',
      'Westhaven',
      'Fieldstone Farms',
      'Ladd Park',
      'Hincheyville',
    ],
    landmarks: ['Harpeth River', 'The Factory at Franklin', 'Pinkerton Park', 'Main Street Historic District'],
    waterways: ['Harpeth River', 'Spencer Creek', 'Watson Branch'],
    housingStock:
      'Two distinct populations: 19th-century masonry foundations of limestone rubble and soft brick downtown, and post-1995 subdivision homes on engineered fill in Cool Springs and Westhaven.',
    local: {
      geology:
        'Franklin straddles the Harpeth River, and the river is the organising fact for below-grade water here. Alluvial soils along the Harpeth and its tributaries hold water in a way the thin residual soil over rock elsewhere in Williamson County does not, so shoreline-adjacent properties see a genuine seasonal water table rather than only storm-driven flow. Away from the river, Franklin returns to the familiar Middle Tennessee condition of shallow limestone with lateral movement above it. The complication specific to Franklin is age. Foundations downtown predate the concept of a drainage plane entirely — limestone rubble laid up with lime mortar, or soft handmade brick, both of which are designed to breathe and both of which are damaged by the impermeable coatings that work fine on modern block.',
      drainage:
        'The two housing populations fail differently, and that changes the correct repair. In the historic district, water arriving through a rubble wall is normal to the wall type. Sealing the interior face with an impermeable coating traps moisture inside the masonry, spalls the brick and turns lime mortar to sand — a repair that visibly works for two years and then costs more than the original problem. The right approach there is managing water before it reaches the wall and letting the wall dry inward: exterior grading, gutter capture, sometimes repointing with a lime mortar that matches the original. In Cool Springs and Westhaven the problem is the opposite and much more mundane: young engineered fill still consolidating, backfill that settles against the foundation and creates a negative slope back toward the house, and downspouts discharging into that settled trench. A large share of newer-Franklin calls are solved by regrading and extending discharge, not by waterproofing.',
      codes:
        'Franklin runs its own Building and Neighborhood Services department rather than going through Williamson County, and the historic district adds a step that catches people out. Exterior work affecting the appearance of a property in the district — which can include visible foundation treatment, grading changes and hardscape tied to drainage — may require Historic Zoning Commission review before permits are issued. That is a scheduling reality, not a formality: review happens on a meeting calendar. Interior drainage and encapsulation generally proceed as repair work, but structural underpinning does not. If your property is anywhere near Main Street, confirm district status early, because the review timeline is the long pole in the schedule.',
      authority: {
        name: 'City of Franklin Building and Neighborhood Services',
        phone: '615-791-3216',
        url: 'https://www.franklintn.gov',
        note: 'Properties in the historic district may require Historic Zoning Commission review for exterior work. Verify district boundaries for your address before scheduling excavation.',
      },
    },
    faqs: [
      {
        q: 'I own a historic home in downtown Franklin. Will waterproofing damage the masonry?',
        a: 'The wrong waterproofing will. Limestone rubble and soft 19th-century brick are vapour-open by design — they get wet and dry out. Coat the inside face with an impermeable sealer and the moisture has nowhere to go, so it accumulates in the wall and takes the mortar and the brick face with it as it freezes and thaws. On these buildings the goal is to reduce how much water reaches the wall and to let the wall keep drying inward. That means grading, gutters, downspout discharge, appropriate lime-based repointing, and interior drainage that collects water without sealing the masonry.',
      },
      {
        q: 'My Westhaven home is only eight years old. Why is water getting in already?',
        a: 'Young houses on engineered fill are the most predictable water calls we take. Backfill around a new foundation keeps consolidating for years after the builder leaves, which turns the original positive grade into a trench sloping back toward the wall. Add a downspout emptying into that trench and you have created a small reservoir against your foundation. It is rarely a foundation defect. Regrading to a positive slope and carrying discharge well clear of the backfill zone resolves a large share of these without touching the structure.',
      },
      {
        q: 'Does living near the Harpeth River change what I need?',
        a: 'Yes. Alluvial soil near the Harpeth holds a genuine seasonal water table, so you can have a slow, sustained wetness that has nothing to do with a particular storm. That is the condition where interior perimeter drainage and a properly sized sump pump earn their cost, because there is continuous water to manage rather than a storm pulse to intercept. It is also the condition where a battery or water-powered backup pump stops being optional — the pump matters most during the storms most likely to take your power out.',
      },
      {
        q: 'Do I need a permit for basement waterproofing in Franklin?',
        a: 'Interior drainage, sump installation and encapsulation are generally treated as repair and maintenance. Structural work — underpinning, piers, altering load-bearing elements — is not, and needs a permit through Franklin Building and Neighborhood Services. The extra Franklin wrinkle is the historic district: if your property is in it, exterior work may need Historic Zoning Commission review first, which runs on a meeting schedule. Confirm your address status before you plan the timeline.',
      },
    ],
  },

  {
    slug: 'hendersonville',
    name: 'Hendersonville',
    county: 'Sumner County',
    state: 'Tennessee',
    stateAbbr: 'tn',
    zips: ['37075', '37077'],
    geo: { latitude: 36.3048, longitude: -86.62 },
    driveTime: '25 minutes from central Nashville',
    status: 'published',
    neighborhoods: [
      'Old Hickory Lake shoreline',
      'Indian Lake Village',
      'Walton Ferry',
      'Sanders Ferry',
      'Bluegrass Yacht and Country Club',
      'Station Camp',
    ],
    landmarks: ['Old Hickory Lake', 'Drakes Creek Park', 'Sanders Ferry Park', 'Rockland Recreation Area'],
    waterways: ['Old Hickory Lake', 'Drakes Creek', 'Station Camp Creek'],
    housingStock:
      'Heavy concentration of 1970s–1990s lakefront and near-lake homes with full or daylight basements, many built on cut-and-fill benches carved into the shoreline slope.',
    local: {
      geology:
        'Hendersonville has a groundwater condition that no other market in Middle Tennessee shares, and it is entirely man-made: Old Hickory Lake. The Corps of Engineers manages the lake at a summer recreation pool and draws it down for winter, and near-shore groundwater tracks that managed level. A basement two hundred yards from the water can therefore sit above the water table in February and below it in June, with nothing about the weather to explain the change. Underneath that, Sumner County is the same soluble Ordovician limestone as the rest of the Central Basin, with the usual shallow bedrock and lateral flow above it. Many of the lakefront homes also sit on cut-and-fill benches created to get a buildable pad out of the shoreline slope, which means one side of the house may bear on undisturbed rock and the other on decades-old fill.',
      drainage:
        'The seasonal-pool effect changes how these problems are diagnosed. A homeowner who describes water appearing in late spring and disappearing in autumn, on a schedule unrelated to rainfall, is usually describing lake-influenced groundwater rather than storm intrusion — and that is a true hydrostatic condition requiring interior drainage and pump capacity, not just interception. On the cut-and-fill lots, the fill side settles differentially against the rock side, which opens the cold joint between wall and footing and gives water a direct path in. Boat-related grading is a smaller recurring theme: driveways and ramps built down toward the water frequently channel runoff straight into the lowest opening in the house.',
      codes:
        'Permitting runs through the City of Hendersonville inside city limits and Sumner County outside them — Metro Nashville rules do not apply here. The consideration specific to this market is the lake itself. Land near Old Hickory Lake may fall within the U.S. Army Corps of Engineers shoreline management boundary, and work within that boundary, including excavation, grading and drainage outfalls, can require Corps authorisation in addition to local permits. That is a genuinely different approval path with its own timeline, and it is the item most likely to delay a lakefront job. Establish early whether your work area falls inside the Corps boundary, because discovering it during excavation is expensive.',
      authority: {
        name: 'City of Hendersonville Codes Department',
        phone: '615-264-5316',
        url: 'https://www.hvilletn.org',
        note: 'Work near Old Hickory Lake may also require U.S. Army Corps of Engineers shoreline authorisation. Properties outside city limits permit through Sumner County.',
      },
    },
    faqs: [
      {
        q: 'Why does my Hendersonville basement get wet in summer and stay dry in winter?',
        a: 'That is the Old Hickory Lake signature. The Corps holds the lake at a higher summer recreation pool and lowers it for winter, and groundwater near the shoreline follows. Your basement floor can sit above the water table in January and below it in June without a drop of unusual rain. Because the water is standing against the structure rather than arriving in pulses, this is a true hydrostatic problem — interior perimeter drainage with adequate pump capacity, rather than surface interception, is the appropriate answer.',
      },
      {
        q: 'Does work near Old Hickory Lake need a Corps of Engineers permit?',
        a: 'It can. Land adjoining the lake may fall inside the Corps shoreline management boundary, and excavation, grading or a drainage outfall inside that boundary may need Corps authorisation on top of your city or county permit. It is a separate review with a separate timeline, and it is the most common cause of delay on lakefront jobs. We establish whether the work area is inside the boundary before scheduling, because finding out mid-excavation is the expensive way.',
      },
      {
        q: 'My house is on a fill pad cut into the slope. Does that matter?',
        a: 'It matters a lot, and it is common on the Hendersonville shoreline. When part of a foundation bears on undisturbed rock and part on fill, the two sides settle at different rates. That differential opens the joint between the footing and the wall, which is precisely where water enters. The tell is a crack or seepage line that follows the transition rather than appearing randomly. In those cases we look at whether the movement is ongoing before installing drainage, because managing water in a foundation that is still moving buys you less time than it should.',
      },
      {
        q: 'Do I need a backup sump pump in Hendersonville?',
        a: 'If you have lake-influenced groundwater, we treat it as necessary rather than optional. A pump on a hydrostatic site is not a convenience — it is the thing holding water out of the space, continuously, through the wet season. Summer storms that raise the load are the same storms that take out power in Sumner County. A battery backup or a water-powered secondary pump means an outage during a June storm is an inconvenience instead of a flooded finished basement.',
      },
    ],
  },

  /* ── DRAFTS ───────────────────────────────────────────────────────────
   * These generate no pages and appear in no sitemap until (a) the local
   * blocks are actually written and (b) status flips to 'published'.
   * Expand only after the four launch markets are indexing.
   */
  ...(
    [
      ['murfreesboro', 'Murfreesboro', 'Rutherford County', ['37127', '37128', '37129', '37130'], 35.8456, -86.3903],
      ['mount-juliet', 'Mount Juliet', 'Wilson County', ['37122'], 36.2, -86.5186],
      ['gallatin', 'Gallatin', 'Sumner County', ['37066'], 36.3883, -86.4467],
      ['smyrna', 'Smyrna', 'Rutherford County', ['37167'], 35.9828, -86.5186],
      ['spring-hill', 'Spring Hill', 'Maury County', ['37174'], 35.7512, -86.93],
      ['nolensville', 'Nolensville', 'Williamson County', ['37135'], 35.9523, -86.6694],
    ] as const
  ).map(
    ([slug, name, county, zips, latitude, longitude]): City => ({
      slug,
      name,
      county,
      state: 'Tennessee',
      stateAbbr: 'tn',
      zips: [...zips],
      geo: { latitude, longitude },
      driveTime: '',
      status: 'draft',
      neighborhoods: [],
      landmarks: [],
      waterways: [],
      housingStock: '',
      local: {
        geology: '',
        drainage: '',
        codes: '',
        authority: { name: '', url: '', note: '' },
      },
      faqs: [],
    }),
  ),
];

export const publishedCities = cities.filter((c) => c.status === 'published');

export function getCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
