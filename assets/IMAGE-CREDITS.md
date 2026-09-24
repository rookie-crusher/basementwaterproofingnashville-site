# Image credits and licensing

Every photograph in `assets/images-src/` is licensed stock, sourced from
[Pexels](https://www.pexels.com/license/). The Pexels License permits free
commercial use with no attribution required and no payment due, so nothing on
the published site carries a credit line. This file is the internal record of
where each file came from, kept so provenance can be re-verified later.

The `.svg` files in `public/images/` are original diagrams authored for this
site; they carry no third-party rights.

## What these photographs are — and are not

They are **reference photography**: images of the assemblies, materials and
conditions the copy describes. They are **not** photographs of this company's
own completed jobs, and no caption, heading or alt string on the site claims
otherwise. The service-area pages label this section "What the work looks
like" and state plainly that the frames are reference photographs.

When real job photography exists, drop it into `assets/images-src/` under the
same filename, re-run `npm run images`, and tighten the caption in
`src/data/site-images.ts`. No other file has to change.

## Source index

Retrieved 2026-08-09 from Pexels.

### Basement waterproofing

| File | Source |
|---|---|
| `work-drainage-trench.jpg` | https://images.pexels.com/photos/37627673/ — drainage pipe installation in an open trench, Elk Grove |
| `work-basement-interior.jpg` | https://images.pexels.com/photos/4092026/ — unfinished basement, block walls and exposed joists |
| `work-foundation-excavation.jpg` | https://images.pexels.com/photos/18214889/ — compact excavator on a residential construction site |
| `work-footing-pour.jpg` | https://images.pexels.com/photos/26107204/ — concrete placed into an excavated footing |
| `work-roof-runoff.jpg` | https://images.pexels.com/photos/20113440/ — rainwater running from a gutter |
| `work-water-staining.jpg` | https://images.pexels.com/photos/7434331/ — water staining and mineral streaking on masonry |

### Crawl space encapsulation

| File | Source |
|---|---|
| `work-crawl-space-access.jpg` | https://images.pexels.com/photos/32497163/ — inspector opening an exterior crawl space hatch |
| `work-underfloor-space.jpg` | https://images.pexels.com/photos/4092030/ — under-floor space with joists, ducting and water heater |
| `work-sealing-seam.jpg` | https://images.pexels.com/photos/6124242/ — sealant bead applied along a framing joint |
| `work-insulation-batts.jpg` | https://images.pexels.com/photos/6124239/ — batt insulation fitted between studs |
| `work-subfloor-framing.jpg` | https://images.pexels.com/photos/33405084/ — residential home under construction, Texas |
| `work-framing-interior.jpg` | https://images.pexels.com/photos/4642438/ — interior of a timber-framed house under construction |

### Site pages

| File | Source | Used on |
|---|---|---|
| `site-inspection.jpg` | https://images.pexels.com/photos/8293678/ — inspector with clipboard in a doorway | Homepage, "What to expect" |
| `site-consultation.jpg` | https://images.pexels.com/photos/8961065/ — homeowners walking a bare interior with a contractor | Homepage, "Need an estimate?" |
| `site-nashville-skyline.jpg` | https://images.pexels.com/photos/28981891/ — Nashville skyline and pedestrian bridge at sunrise | `/areas-we-serve/` |
| `site-brick-home.jpg` | https://images.pexels.com/photos/26595553/ — brick house with a masonry foundation course | `/areas-we-serve/` |

### Article photography

| File | Source |
|---|---|
| `blog-shallow-limestone-excavation.jpg` | Pexels — tracked excavator with a hydraulic breaker working solid limestone |
| `blog-spalled-brick-interior-sealer.jpg` | Pexels — masonry where a surface coating has detached, taking the brick face with it |
| `blog-bituminous-coating-foundation.jpg` | Pexels — roller applying a black bituminous coating to a masonry wall |
| `blog-sealed-crawl-space-penetrations.jpg` | Pexels — sealant bead run along a framing joint (same source file as `work-sealing-seam.jpg`) |
| `blog-radon-test-kit-placement.jpg` | Pexels — consumer radon monitors on a side table |

## Slots deliberately left empty

An earlier revision filled these five article slots with photographs that did
not show the subject the caption described — four of them came from a single
commercial-deck waterproofing shoot in China, and two carried another
contractor's branding and freephone number. They have been removed rather than
swapped for a different loose match, because a photograph that contradicts its
own caption is worse than no photograph. `SmartImage` and the article renderer
both drop an unmatched slot silently, so the pages publish with one fewer
figure and no gap:

- `blog-torn-vapor-barrier-before` — needs a torn liner over crawl space soil
- `blog-crawl-space-standing-water` — needs standing water on a crawl space floor
- `blog-encapsulation-after` — needs a finished encapsulation with a dehumidifier
- `blog-vapor-barrier-stem-wall-termination` — needs a liner terminated on a stem wall
- `blog-drainage-board-membrane` — needs dimpled drainage board over a membrane

All five are job-site shots that no stock library covers honestly. Photograph
them on the next relevant job, drop the files into `assets/images-src/` under
those exact names, and run `npm run images` — the figures reappear with the
captions already written. `npm run shotlist` prints the full brief for each.
