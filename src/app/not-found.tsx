import Link from 'next/link';
import { CallButton } from '@/components/CallButton';
import { publishedCities } from '@/data/cities';
import { publishedServices } from '@/data/services';
import { pseoPath } from '@/data/registry';

export const metadata = { title: 'Page not found', robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl">That page isn&rsquo;t here</h1>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-grade-800">
        The link may be out of date. If you have water coming in, call us and skip the browsing.
      </p>
      <div className="mt-7">
        <CallButton />
      </div>

      <div className="mt-12 border-t border-limestone-300 pt-8">
        <p className="eyebrow">Service pages</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {publishedServices.flatMap((s) =>
            publishedCities.map((c) => (
              <li key={`${s.slug}-${c.slug}`}>
                <Link
                  href={pseoPath(s, c)}
                  className="text-sm underline decoration-limestone-300 hover:text-water-700"
                >
                  {s.shortName} in {c.name}
                </Link>
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
