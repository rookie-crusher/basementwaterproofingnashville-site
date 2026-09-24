import { site } from '@/data/site';
import { Icon, type IconName } from './Icons';

/**
 * Differentiator grid, adapted from the structure that works on high-converting
 * contractor sites: six specific promises, each with a mechanism under it.
 *
 * Every item here is something the business actually controls. Generic claims
 * ("satisfaction guaranteed") are what make these blocks read as filler, so
 * each one names what happens instead of how it feels.
 */
const items: { title: string; body: string; icon: IconName }[] = [
  {
    title: 'Diagnosis before a price',
    body: 'Storm flow, a water table and a plumbing leak look identical once the floor is wet. We establish which one you have on site, then quote.',
    icon: 'search',
  },
  {
    title: 'Written scope, every time',
    body: 'You get the work written down before anything starts, in enough detail that you can hand it to another contractor and compare like for like.',
    icon: 'clipboard',
  },
  {
    title: 'No phone quotes',
    body: 'We will not price a system for a house nobody has looked at. If a number over the phone is what you want, we are the wrong company.',
    icon: 'phone',
  },
  {
    title: 'Local ground conditions',
    body: `Shallow limestone, karst and lateral storm flow behave differently in ${site.address.locality} than in Brentwood or on the Old Hickory shoreline. The design follows the site.`,
    icon: 'layers',
  },
  {
    title: 'Tested under load',
    body: 'We run water against the finished system, confirm the discharge goes where it should, and walk the outfall with you so you know what to watch.',
    icon: 'droplet',
  },
  {
    title: 'Permits handled where needed',
    body: 'Interior drainage is usually repair work. Structural work is not. We confirm the requirement with your jurisdiction rather than guessing.',
    icon: 'stamp',
  },
];

export function WhatToExpect() {
  return (
    <section aria-labelledby="expect-heading">
      <p className="eyebrow">What to expect</p>
      <h2 id="expect-heading" className="mt-2 text-3xl uppercase tracking-tight sm:text-4xl">
        Six things we commit to in writing
      </h2>

      <ul className="mt-9 grid gap-px bg-limestone-300 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <li key={it.title} className="bg-limestone-50 p-6">
            <span className="flex h-12 w-12 items-center justify-center bg-grade-950 text-water-300">
              <Icon name={it.icon} className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-lg font-extrabold leading-snug">{it.title}</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-grade-800">{it.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
