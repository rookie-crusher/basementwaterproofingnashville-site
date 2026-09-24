import Link from 'next/link';
import { CallButton, PhoneIcon } from './CallButton';
import { site, telHref } from '@/data/site';

const links = [
  { href: '/services/', label: 'Services' },
  { href: '/areas-we-serve/', label: 'Areas' },
  { href: '/blog/', label: 'Guides' },
  { href: '/testimonials/', label: 'Reviews' },
  { href: '/contact/', label: 'Contact' },
];

export function Nav() {
  return (
    <header>
      {/*
        Announcement bar. The number is the conversion goal, so it gets the
        highest-contrast surface on the page and sits above everything else —
        including the logo — rather than being tucked into the header row where
        it competes with navigation for the same glance.
      */}
      <div className="bg-grade-950 text-limestone-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-4 py-2 text-center sm:px-6">
          <p className="font-display text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-water-300">
            Call now for a free on-site diagnosis
          </p>
          <a
            href={telHref}
            className="font-display text-base font-extrabold tracking-tight text-limestone-50 underline decoration-water-500 decoration-2 underline-offset-4 hover:text-water-300"
            data-conversion="call-bar"
            aria-label={`Call ${site.brand} at ${site.phone.display}`}
          >
            {site.phone.display}
          </a>
        </div>
      </div>

      <div className="border-b border-limestone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
            {/*
              The shield mark, paired with a typographic wordmark rather than
              the wordmark baked into the supplied logo file. That file sets the
              domain name over two awkwardly broken lines, which does not hold
              up at nav size. Dimensions are explicit so the header never shifts
              while the logo loads.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-mark.png"
              alt=""
              width={162}
              height={132}
              className="h-10 w-auto sm:h-12"
              fetchPriority="high"
            />
            <span className="block">
              <span className="block font-display text-[0.9375rem] font-extrabold uppercase leading-none tracking-[0.01em] text-grade-900 min-[420px]:text-[1.0625rem] sm:text-[1.125rem]">
                Basement Waterproofing
              </span>
              <span className="mt-1 block spec text-[0.6875rem] uppercase tracking-[0.24em] text-water-700">
                Nashville
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="ml-auto hidden items-center gap-7 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-display text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-grade-800 transition-colors hover:text-water-700"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center lg:ml-7">
            {/* Phones get an icon-only target: the full number does not fit
                beside the wordmark at 390px and used to wrap onto four lines.
                The sticky footer bar carries the number on mobile. */}
            <a
              href={telHref}
              className="cta-primary !min-h-[2.75rem] !w-11 !px-0 sm:hidden"
              aria-label={`Call ${site.brand} at ${site.phone.display}`}
              data-conversion="call-header"
            >
              <PhoneIcon />
            </a>
            <CallButton className="!min-h-[2.75rem] !px-4 !text-[0.9375rem] max-sm:hidden" />
          </div>
        </div>

        {/* Secondary rail: the links that do not fit the main row on a laptop,
            plus the operational promise. Scrolls rather than wraps on mobile. */}
        <div className="border-t border-limestone-200 bg-limestone-100">
          <div className="mx-auto flex max-w-6xl items-center gap-x-5 gap-y-1 overflow-x-auto px-4 py-2 sm:px-6">
            <nav aria-label="Secondary" className="flex shrink-0 items-center gap-5 lg:hidden">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="spec whitespace-nowrap text-[0.6875rem] uppercase tracking-[0.14em] text-grade-600 hover:text-water-700"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <p className="spec ml-auto hidden whitespace-nowrap text-[0.6875rem] uppercase tracking-[0.14em] text-grade-600 lg:block lg:ml-0">
              {site.emergencyNote} &middot; {site.serviceAreaLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
