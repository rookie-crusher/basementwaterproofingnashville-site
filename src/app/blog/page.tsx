import Link from 'next/link';
import type { Metadata } from 'next';
import { allArticles, clusters, cardImage } from '@/lib/blog';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/schema';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CallButton } from '@/components/CallButton';
import { SmartImage } from '@/components/SmartImage';

export const metadata: Metadata = buildMetadata({
  path: '/blog/',
  title: 'Basement and Crawl Space Guides | Middle Tennessee',
  description:
    'Practical guides to basement water, crawl space moisture, foundations and radon in Middle Tennessee, written by the crews who do the work.',
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Guides', path: '/blog/' },
];

export default function BlogIndex() {
  const articles = allArticles();
  const groups = clusters();

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail)} />

      <section className="border-b border-limestone-200 bg-limestone-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Breadcrumbs trail={trail} />
          <h1 className="mt-6 text-4xl sm:text-5xl">Guides</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-grade-800">
            What we find under houses in Middle Tennessee, what the code actually requires, and
            how to tell a drainage problem from a structural one. Written for homeowners, with the
            numbers and the sources.
          </p>
          <p className="mt-4 spec text-xs text-grade-600">
            {articles.length} {articles.length === 1 ? 'guide' : 'guides'} across {groups.length}{' '}
            {groups.length === 1 ? 'topic' : 'topics'}
          </p>
        </div>
      </section>

      {articles.length === 0 ? (
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-grade-600">No guides published yet.</p>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          {groups.map((g) => (
            <section key={g.name} className="mb-14 last:mb-0">
              <h2 className="text-2xl">{g.name}</h2>
              <ul className="mt-5 grid gap-px bg-limestone-300 md:grid-cols-2">
                {g.articles.map((a) => {
                  const lead = cardImage(a);
                  return (
                    <li key={a.slug} className="bg-limestone-100 p-5">
                      {lead && (
                        <Link href={`/blog/${a.slug}/`} className="mb-3 block">
                          <SmartImage
                            name={lead.slot}
                            alt={lead.alt}
                            aspect="16 / 10"
                            className="h-44 w-full rounded object-cover"
                          />
                        </Link>
                      )}
                      <h3 className="font-display text-xl font-bold leading-snug">
                        <Link href={`/blog/${a.slug}/`} className="hover:text-water-700">
                          {a.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-grade-800">
                        {a.description}
                      </p>
                      <p className="mt-3 spec text-xs text-grade-600">
                        <time dateTime={a.datePublished}>
                          {new Date(a.datePublished).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                        {' · '}
                        {a.readingMinutes} min read
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <section className="below-grade">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-3xl">Reading about it is not a diagnosis</h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-limestone-200">
            If you have water coming in, an on-site inspection tells you which of these situations
            you actually have. It is free, and it comes with a written scope.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <CallButton />
            <Link href="/contact/" className="cta-secondary">
              Request an inspection
            </Link>
          </div>
          <p className="mt-5 spec text-xs text-grade-400">
            {site.serviceAreaLabel} · {site.emergencyNote}
          </p>
        </div>
      </section>
    </>
  );
}
