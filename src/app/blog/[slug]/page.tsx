import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { allArticles, getArticle, relatedArticles, tableOfContents } from '@/lib/blog';
import { site } from '@/data/site';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, faqSchema, articleSchema } from '@/lib/schema';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CallButton } from '@/components/CallButton';

export const dynamicParams = false;

export function generateStaticParams() {
  return allArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  const meta = buildMetadata({
    path: `/blog/${slug}/`,
    title: a.metaTitle,
    description: a.description,
  });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: 'article',
      publishedTime: a.datePublished,
      modifiedTime: a.dateModified,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const path = `/blog/${slug}/`;
  const toc = tableOfContents(article);
  const related = relatedArticles(article, 3);

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/blog/' },
    { name: article.title, path },
  ];

  return (
    <>
      <JsonLd data={articleSchema(article, `${site.domain}${path}`)} />
      <JsonLd data={faqSchema(article.faqs)} />
      <JsonLd data={breadcrumbSchema(trail)} />

      <div className="border-b border-limestone-200 bg-limestone-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Breadcrumbs trail={trail} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
          <article className="min-w-0">
            <p className="eyebrow">{article.cluster}</p>
            <h1 className="mt-3 text-[2.125rem] leading-tight sm:text-[2.75rem]">
              {article.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 spec text-xs text-grade-600">
              <time dateTime={article.datePublished}>
                {new Date(article.datePublished).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              <span>{article.readingMinutes} min read</span>
              <span>{article.wordCount.toLocaleString()} words</span>
            </div>

            {/* Mobile table of contents */}
            {toc.length > 2 && (
              <details className="mt-7 border border-limestone-300 bg-limestone-50 p-4 lg:hidden">
                <summary className="cursor-pointer font-display font-bold">On this page</summary>
                <ol className="mt-3 space-y-1.5">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="text-sm underline decoration-limestone-300">
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <div
              className="article-prose mt-9"
              dangerouslySetInnerHTML={{ __html: article.html }}
            />

            {/* Closing conversion block */}
            <aside className="mt-14 border-l-4 border-hivis-500 bg-limestone-50 p-6">
              <p className="eyebrow">Next step</p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Find out which of these you actually have
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-grade-800">
                An on-site inspection separates a grading problem from a groundwater problem from a
                structural one. It is free, and you get a written scope you can take to another
                contractor and compare.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <CallButton />
                <Link href="/contact/" className="cta-secondary">
                  Request an inspection
                </Link>
              </div>
            </aside>

            {related.length > 0 && (
              <section className="mt-14 border-t border-limestone-300 pt-8">
                <h2 className="text-2xl">Related guides</h2>
                <ul className="mt-5 grid gap-px bg-limestone-300 sm:grid-cols-3">
                  {related.map((r) => (
                    <li key={r.slug} className="bg-limestone-100 p-4">
                      <h3 className="font-display text-base font-bold leading-snug">
                        <Link href={`/blog/${r.slug}/`} className="hover:text-water-700">
                          {r.title}
                        </Link>
                      </h3>
                      <p className="mt-1.5 spec text-xs text-grade-600">
                        {r.readingMinutes} min read
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              {toc.length > 2 && (
                <nav aria-label="On this page">
                  <p className="eyebrow">On this page</p>
                  <ol className="mt-3 space-y-2 border-l border-limestone-300 pl-4">
                    {toc.map((t) => (
                      <li key={t.id}>
                        <a
                          href={`#${t.id}`}
                          className="block text-sm leading-snug text-grade-600 hover:text-water-700"
                        >
                          {t.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="mt-8 border border-limestone-300 bg-limestone-50 p-4">
                <p className="eyebrow">Free diagnosis</p>
                <p className="mt-2 text-sm leading-relaxed text-grade-800">
                  We find the water path before quoting.
                </p>
                <CallButton className="mt-3 w-full !min-h-[2.75rem] !px-3 !text-[0.9375rem]" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
