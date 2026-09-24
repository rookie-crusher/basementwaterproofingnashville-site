# Basement Waterproofing Nashville — pSEO site

Static Next.js (App Router) site that exports to plain HTML for Hostinger.
Every page is generated from the data layer in `src/data/`, so adding a market
or a service is a data edit, not a code edit.

---

## How the site is published

```
/admin (PHP on Hostinger) --commit--> GitHub: main --Action builds--> GitHub: deploy --Hostinger Git--> public_html
```

1. Articles are edited at **https://basementwaterproofingnashville.com/admin/**.
   Publishing commits to the `main` branch of the public repository
   `rookie-crusher/basementwaterproofingnashville-site`.
2. `.github/workflows/deploy.yml` runs `npm ci && npm run build` and pushes the
   contents of `out/` to the `deploy` branch.
3. Hostinger's Git auto-deployment pulls `deploy` into `public_html`.

Changes are live about 2 to 4 minutes after saving. Commits whose message
contains `[skip ci]` (drafts, image uploads, trash) do not build. Editing
files directly and pushing to `main` publishes the same way.

To build locally: `npm install && npm run build`, then `npm run preview`.

### Why the config is the way it is

| Setting | Reason |
|---|---|
| `output: 'export'` | Hostinger serves static files; there is no Node server. |
| `trailingSlash: true` | Produces `out/<slug>/index.html`, which Apache/LiteSpeed serves with no rewrite rules. Canonicals and sitemap URLs carry the same trailing slash so they match the real URL. |
| `images: { unoptimized: true }` | Required by static export — the `next/image` optimizer needs a server. Replaced by `scripts/optimize-images.mjs`. |
| Fonts via `@fontsource` | Self-hosted from npm rather than `next/font/google`, so the build has no external network dependency and there is no runtime request to `fonts.gstatic.com`. |

---

## Admin panel

A WordPress-style editor at `/admin/`. The code is in `public/admin/`, so it
ships with every build.

| Feature | Where it lands |
|---|---|
| Rich-text editor (TinyMCE: headings, lists, links, tables, quotes, embeds, FAQ block, source view) | Converted to markdown on save, so the table of contents and FAQ schema keep working |
| Images: upload, drag-drop, paste, alt text, caption, featured image | Resized to 2400px in the browser, committed to `assets/images-src/` (SVGs to `public/images/`), plus an `{{image:N}}` brief in frontmatter. The build makes AVIF/WebP |
| URL slug, SEO title, meta description (with counters and a Google preview), category, keywords, related articles | Frontmatter |
| Draft / published | `draft: true` keeps an article out of the build, the sitemap and the publish checks |
| Renaming a published slug | Adds a 301 to `content/redirects.json` (written into `.htaccess` on build) and updates links in other articles |
| Revisions | Git history of the article file (renaming starts a fresh history) |
| Trash | `content/.trash/`; restores come back as drafts |

**How it is built.** `api.php` is a thin, login-protected relay to the GitHub
API; the article logic (markdown conversion, validation, the frontmatter
format) runs in the browser (`public/admin/assets/core/`), and every save is
one commit. The panel can only write under `content/`, `assets/images-src/`
and `public/images/`, never code or the workflow. It refuses to publish an
article that would fail the build (same rules as `src/lib/blog.ts`).

**Secrets live outside the web root**, in
`/home/<user>/domains/basementwaterproofingnashville.com/bw-admin-data/`:
the GitHub token (`config.json`), the login's bcrypt hash (`credentials.json`),
sessions and a cache. The repository is public, so no credentials ship with
the code: on first visit `/admin/` shows a one-time setup form that asks for
the GitHub token and creates the login. Only the repository owner can make a
token that writes to this repository, so nobody else can claim the admin.
Locked out: delete `bw-admin-data/credentials.json` in File Manager and set up
again. Five wrong attempts lock logins for 15 minutes.

**The GitHub token** is a fine-grained token limited to this one repository
with *Contents: Read and write* and *Actions: Read and write*. If it expires,
the panel says so and asks for a new one on the Settings page.

**Running it locally** (needs PHP 8.1+ with curl):
`npm run admin:local`, then http://127.0.0.1:4321/admin/. It uses
`./bw-admin-data/` and commits to the real repository, so it publishes like
the live panel.

---

## Before you go live

These are deliberately blank rather than filled with plausible-looking
placeholders. Search `TODO(owner)` in `src/data/site.ts`.

- [ ] **Real street address** in `site.address`. Google suspends virtual
      offices and PO boxes. As a service-area business you still must give
      Google a real address; you can hide it on the profile.
- [ ] **TN contractor licence number** in `site.credentials.tnLicense`. The
      "Licensed" trust badge does not render until this is filled in, on
      purpose — it is regulated advertising language.
- [ ] **Google Place ID** in `site.profiles.googlePlaceId`. Switches on the
      "Write a Google review" link on `/testimonials/` — the route to getting
      reviews that *can* carry star markup. See the Reviews section.
- [ ] **Warranty term and years in business**, if you want those badges.
- [ ] **Check the lead form on a real phone** and tune `mobileHeight` in
      `src/data/lead-form.ts` if the form scrolls inside its own frame.
- [ ] Verify the permit and code claims on each city page against the
      authority listed on that page. They were researched, not invented, but
      codes change and you are the one publishing them.

### NAP consistency

`src/data/site.ts` is the single source of truth for name, address and phone.
Nothing else in the codebase hardcodes them. When you change the phone number
there, change it in the same session on: Google Business Profile, Apple
Business Connect, Bing Places, Yelp, Facebook, BBB, and every citation
directory. Mismatched NAP between site and GBP is the most common local
ranking problem.

The phone number is `+1 615-759-0553` — a local Nashville number, which is
what Google Business Profile wants. Do not swap it for a toll-free number.

---

## Adding a city

1. Add the entry to `src/data/cities.ts` with `status: 'draft'`.
2. Write the `local` blocks: `geology`, `drainage`, `codes`, plus
   `neighborhoods`, `waterways`, `housingStock`, `authority` and at least
   three city-specific `faqs`.
3. Add a `localLens` entry for that city in **each** published service in
   `src/data/services.ts`.
4. Flip `status` to `'published'` and run `npm run build`.

Routes, the sitemap, internal links and the footer update themselves.

**The build will refuse to publish a thin city.** `src/lib/validate.ts` runs
during `next build` and fails on short local content, missing FAQs, missing
authority, or local copy duplicated from another city. If it blocks you, write
the content — do not lower the thresholds. Publishing near-identical
programmatic pages is what causes "Crawled – currently not indexed" to spread
across a whole domain rather than just the thin pages.

## Adding a service

Same shape, in `src/data/services.ts`. A published service needs a `blurb`,
3+ `symptoms`, 3+ `process` steps, a `faqsFor(city)` generator, and a
`localLens` entry for every published city.

---

## Monitoring content quality as you scale

```bash
npm run build && npm run overlap
```

`scripts/content-overlap.mjs` measures pairwise 8-gram overlap between every
generated page. Current worst pair is ~64% (the two service pages for the same
city, which share the city's geology section plus the nav and footer).

Guide: under 50% is healthy, 50–65% is acceptable when the shared portion is
legitimate shared navigation, over 70% fails the check. Watch the **trend** as
you add markets, not the absolute number.

If it climbs, the two structural fixes are:

1. Write service-specific local blocks, so the geology section on the crawl
   space page differs from the one on the waterproofing page; or
2. Publish one service per city and route the others through a city hub page.

---

## Images

Drop originals into `assets/images-src/` (outside `public/`, so the multi-megabyte
originals never ship), then:

```bash
npm run images
```

Each source produces AVIF + WebP at up to four widths in `public/images/`, and
an entry in `src/data/image-manifest.json` recording intrinsic dimensions.
`<SmartImage>` reads that manifest and emits `width`/`height` plus a full
`srcset`, which is what keeps CLS at zero.

Name files to match what the pages ask for:
`<city-slug>-<service-slug>-<1|2|3>.jpg`, e.g.
`brentwood-basement-waterproofing-1.jpg`. Until a file exists, the page shows
a labelled placeholder naming the file it wants.

Alt text is generated by `projectAlt()` in `src/lib/util.ts` as
`"<Service> project completed in <City>, <ST> — <detail>"`. It is a required
argument on `<SmartImage>`, not optional.

---

## Reviews

`src/data/reviews.ts` holds the 15 five-star reviews you supplied, shown
verbatim on `/testimonials/` and surfaced on the programmatic pages.

### The one thing to know: these cannot carry star markup

These reviews were collected on basementwaterproofingnashville.com — your own
site. Google calls that **self-serving**: a review about a business, hosted on
a site the business controls. Google's review snippet policy does not allow
self-serving reviews to be marked up with `Review` or `AggregateRating` for
`LocalBusiness` or `Organization`. Doing it anyway risks rich results being
switched off for the whole domain, and it is trivially checkable.

So the code separates display from markup, structurally:

| | What happens |
|---|---|
| **Display** | All 15 render on the site. Completely fine, good for conversion. |
| **Markup** | `eligibleForSchema()` filters to third-party reviews. That is empty today, so **no** `Review` or `AggregateRating` JSON-LD is emitted anywhere. |

The filter lives inside `reviewSchema()` in `src/lib/schema.ts`, not at the
call sites, so no page can mark them up by accident. Verify any time with:

```bash
grep -ro '"@type":"AggregateRating"' out/ | wc -l   # must be 0
```

### How to earn the stars

Ask these same 15 customers to re-post on **Google Business Profile**. Once
`site.profiles.googlePlaceId` is filled in, `/testimonials/` shows a "Write a
Google review" button using Google's own review link. Add each Google review to
`reviews.ts` with `source: 'Google'` and a `sourceUrl`, and `AggregateRating`
switches itself on at three reviews — no code change.

Google reviews also feed the local pack directly, which matters more than star
markup does. Target 2-5 per month, steady rather than in bursts.

### Two gaps in the imported data

- **No dates.** The source had none, and `datePublished` is omitted rather than
  guessed. A fabricated date in schema is still a fabrication.
- **No city tags.** `citySlug` is undefined on all 15, so no city page can
  claim a job it cannot evidence. Fill these in from your records and the
  matching city page starts featuring that review automatically.

One review mentions a warranty. `site.credentials.warrantyYears` is still
`null`, so no warranty badge renders. Worth setting if you do offer one.

---

## Lead form (LeadSmart)

Configured in `src/data/lead-form.ts`. The iframe is on funnel 4 with your API
key and affiliate source, and it renders through `LeadFormSlot` on the home
page, all programmatic pages, `/contact/` and `/testimonials/`.

Two changes were needed to the supplied code.

**1. The `<head>` snippet is not used verbatim.** It wrapped the real script tag
in `document.write()`. That only works while the browser is still parsing the
initial HTML — called after the document has loaded, which is what happens in
any React app, it **wipes the page** and replaces it with the script tag. It is
also a parser-blocking third-party request in `<head>`, which Lighthouse flags
twice and which works against the 95+ target.

The snippet's only actual job is injecting one external script, so that script
is loaded directly via `next/script` with `strategy="afterInteractive"`. Same
end result, no page-blanking risk, off the critical path. If LeadSmart support
pushes back, ask what the wrapper does beyond injecting `embed.js`.

**2. The iframe is fluid, not 600px fixed.** A hard `width="600"` overflows a
375-390px phone viewport and causes horizontal scroll. It is now `width: 100%`
capped at 600px, with height from config: 545px desktop (their value) and 700px
under 640px wide, because the fields stack on a phone and a short iframe
scrolls internally — users do not notice, and it silently costs leads. **Check
this on a real phone and tune `mobileHeight`.**

### One tradeoff to be aware of

A third-party iframe is the most expensive thing on these pages. On mobile the
hero stacks headline → call button → form, so the iframe is not the LCP
element and the phone CTA — your stated priority — is first. It is still worth
running PageSpeed after launch: if mobile lands below 95, the iframe is why,
and the lever is moving it further down the programmatic pages rather than
removing it.

---

## Brand assets

Source art lives in `assets/brand-src/`. Regenerate derivatives with:

```bash
npm run brand
```

That produces, into `public/brand/`: `logo-mark.png` (nav, transparent),
`icon-32/48/192/512.png`, `apple-icon.png`, and `logo.png` (512px square, used
as the `logo` property in `Organization` schema).

Three decisions worth knowing:

- **The palette was changed to match the logo.** `--color-grade-950` is now
  `#141a2f`, sampled directly from the navy in your mark. It was previously a
  teal-leaning near-black, which read as a different colour family next to the
  logo. The dark sections and the logo are now literally the same navy.
- **The nav uses the shield mark with type set in Archivo**, not the wordmark
  baked into the logo file. That file sets the domain name over two awkwardly
  broken lines, which does not hold up at nav size.
- **The footer keeps the typographic lockup** rather than the mark, because a
  navy mark on a navy background is invisible. If you want the logo down there,
  a light/reversed version of the mark is the missing asset.

`og-image.png` (1200×630 social card) is a committed static asset rather than
generated, because it has type set in the real brand fonts. Remake it in a
design tool if the phone number or brand changes.

At 16-32px the shield and droplet detail is largely lost and the favicon reads
as "BW". This was tested against a tight crop on just the lettering and the
full mark won, because cropping clips the shield into stray marks. If you want
something sharper at 16px, that needs a purpose-drawn simplified mark.

---

## Structure

```
.github/workflows/deploy.yml   build on push to main, publish to the deploy branch
public/admin/      admin panel (ships with the site)
  index.php, api.php  login gate and the GitHub relay
  lib/               auth, GitHub client, config (never served)
  assets/            the panel's UI (plain ES modules, no build step)
  assets/core/       article format + markdown conversion (browser and Node)
content/blog/      articles (markdown + frontmatter)
src/
  data/            the only files you normally edit
    site.ts          NAP, hours, credentials, profiles — single source of truth
    cities.ts        markets + hand-written local content
    services.ts      services + per-city localLens + FAQ generators
    reviews.ts       real reviews only (currently empty)
    lead-form.ts     form embed slot
    registry.ts      builds the service x city routing table
  lib/
    schema.ts        JSON-LD builders (prunes empty values)
    seo.ts           canonical + metadata helpers
    validate.ts      build-time guardrails against thin pages
  components/        UI
  app/
    [slug]/page.tsx  the pSEO template — one route, every combination
    sitemap.ts       regenerated from the data layer; runs validation
    robots.ts
scripts/
  optimize-images.mjs   AVIF/WebP pipeline + manifest
  post-export.mjs       writes out/.htaccess
  content-overlap.mjs   duplicate-content monitor
assets/images-src/      source images (never shipped)
```

### URL pattern

`/[service]-[city]-[state]/` — e.g. `/basement-waterproofing-brentwood-tn/`

Routing goes through a registry (`src/data/registry.ts`) rather than parsing
the slug, because both halves contain hyphens (`crawl-space-encapsulation`,
`mount-juliet`) and splitting on `-` breaks as soon as you add a two-word city.

### Sitemap splitting

A single `sitemap.xml` is correct until 10,000 URLs. The build throws a clear
error with the migration path at that threshold rather than shipping untested
chunking for 13 URLs.

---

## Local SEO work that is not in this repo

The site is the smaller half of ranking in the local pack. Distance you cannot
control; relevance and prominence you can.

1. **Google Business Profile** — the single highest-leverage asset. Primary
   category `Waterproofing Service`, secondary categories for crawl space and
   foundation work, 10+ real photos, weekly Posts, and seed the Q&A section
   yourself with the questions from the FAQ blocks.
2. **Business name** — "Basement Waterproofing Nashville" works as a domain
   and as site branding. Only use it as your GBP name if it is your actual
   registered business name; keyword-stuffed profile names are a common
   suspension trigger.
3. **Foundation citations** — GBP, Apple Business Connect, Bing Places, Yelp,
   Facebook, BBB. Then home-services directories: Angi, HomeAdvisor,
   Thumbtack. Quality over quantity: 30 accurate listings beat 200 thin ones.
4. **Local citations** — Nashville Area Chamber of Commerce, Williamson County
   and Sumner County chambers, local news and sponsorship pages.
5. **Reviews** — aim for 2–5 per month, steady rather than in bursts; a spike
   looks unnatural. Ask at the point of service, follow up with the direct
   link, respond within 24 hours, and reference something specific from each
   review. Never incentivise reviews — it violates Google's guidelines.
