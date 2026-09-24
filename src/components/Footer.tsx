import Link from 'next/link';
import { site, telHref, formattedAddress } from '@/data/site';
import { publishedCities } from '@/data/cities';
import { publishedServices } from '@/data/services';
import { pseoPath } from '@/data/registry';

export function Footer() {
  const addr = formattedAddress();

  return (
    <footer className="below-grade border-t border-grade-800 pb-24 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          {/* NAP block — must match Google Business Profile exactly */}
          <div className="md:col-span-1">
            <p className="font-display text-lg font-extrabold uppercase leading-tight tracking-tight text-limestone-50">
              {site.brand}
            </p>
            <address className="mt-3 not-italic text-sm leading-relaxed text-grade-400">
              {addr ? (
                <span className="block">{addr}</span>
              ) : (
                <span className="block">
                  Serving {site.serviceAreaLabel}
                  <br />
                  Mobile service — no walk-in location
                </span>
              )}
              <a href={telHref} className="mt-2 block font-mono text-base text-hivis-500">
                {site.phone.display}
              </a>
              <a href={`mailto:${site.email}`} className="block break-all text-sm underline">
                {site.email}
              </a>
            </address>
            <dl className="mt-4 spec text-xs text-grade-400">
              {site.hours.map((h) => (
                <div key={h.days.join()} className="flex gap-2">
                  <dt>
                    {h.days.length > 1
                      ? `${h.days[0].slice(0, 3)}–${h.days[h.days.length - 1].slice(0, 3)}`
                      : h.days[0].slice(0, 3)}
                  </dt>
                  <dd>
                    {h.opens}–{h.closes}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Internal linking: service × city grid. This is the crawl path.
              Two services fill two columns; the third carries the rest of the
              site so the row does not end in dead space. */}
          <div className="md:col-span-3">
            <p className="eyebrow">Services by area</p>
            <div className="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {publishedServices.map((s) => (
                <div key={s.slug}>
                  <p className="font-display text-sm font-extrabold text-limestone-100">{s.name}</p>
                  <ul className="mt-2 space-y-1.5">
                    {publishedCities.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={pseoPath(s, c)}
                          className="text-sm text-grade-400 underline decoration-grade-600 hover:text-water-300"
                        >
                          {s.shortName} in {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <p className="font-display text-sm font-extrabold text-limestone-100">
                  About {site.brand}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-grade-400">
                  We diagnose where water enters a Middle Tennessee house before quoting a system
                  to stop it, and put the scope in writing first. {site.emergencyNote}.
                </p>
                <ul className="mt-4 space-y-1.5">
                  {[
                    { href: '/services/', label: 'All services' },
                    { href: '/areas-we-serve/', label: 'Areas we serve' },
                    { href: '/blog/', label: 'Guides' },
                    { href: '/testimonials/', label: 'Reviews' },
                    { href: '/contact/', label: 'Contact' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-grade-400 underline decoration-grade-600 hover:text-water-300"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 gradeline" data-depth="Grade" style={{ background: 'var(--color-grade-950)' }} />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 spec text-xs text-grade-400">
          <p>
            &copy; {new Date().getFullYear()} {site.legalName}
            {site.credentials.tnLicense && <> &middot; TN License #{site.credentials.tnLicense}</>}
          </p>
          <nav aria-label="Footer" className="flex gap-5">
            <Link href="/blog/" className="hover:text-water-300">
              Guides
            </Link>
            <Link href="/testimonials/" className="hover:text-water-300">
              Reviews
            </Link>
            <Link href="/contact/" className="hover:text-water-300">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
