import Link from 'next/link';
import { Icon, type IconName } from './Icons';

/**
 * The icon rail directly under the hero: five short routes to the things a
 * visitor with water in the basement actually wants. It sits above the fold on
 * a laptop and is the first navigation most people use, so every target is a
 * real page rather than an anchor into the same document.
 */
const items: { href: string; label: string; icon: IconName }[] = [
  { href: '/services/', label: 'Waterproofing', icon: 'droplet' },
  { href: '/services/', label: 'Crawl Space', icon: 'house' },
  { href: '/areas-we-serve/', label: 'Service Areas', icon: 'pin' },
  { href: '/contact/', label: 'Book a Visit', icon: 'calendar' },
  { href: '/testimonials/', label: 'Reviews', icon: 'star' },
];

export function QuickLinks() {
  return (
    <nav aria-label="Quick links" className="border-b border-limestone-200 bg-limestone-50">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-limestone-200 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((it) => (
          <li key={it.label} className="bg-limestone-50 last:odd:col-span-2 sm:last:odd:col-span-1">
            <Link
              href={it.href}
              className="flex h-full flex-col items-center justify-start gap-2.5 px-3 py-6 text-center transition-colors hover:bg-limestone-100"
            >
              <Icon name={it.icon} className="h-8 w-8 text-water-700" />
              <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-grade-800">
                {it.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
