/**
 * FAQ accordion built on <details>/<summary> — no JavaScript, no hydration
 * cost, keyboard accessible for free, and the answer text is in the HTML so
 * it is crawlable and eligible for AI Overview extraction.
 */
export function Faq({
  faqs,
  heading = 'Questions homeowners actually ask',
}: {
  faqs: { q: string; a: string }[];
  heading?: string;
}) {
  if (!faqs.length) return null;

  return (
    <section aria-labelledby="faq-heading">
      <p className="eyebrow">Answers</p>
      <h2 id="faq-heading" className="mt-2 font-display text-3xl font-bold">
        {heading}
      </h2>

      <div className="mt-6 border-t border-limestone-300">
        {faqs.map((f) => (
          <details key={f.q} className="group border-b border-limestone-300">
            <summary className="flex cursor-pointer list-none items-start gap-3 py-4 font-display text-[1.0625rem] font-semibold leading-snug marker:hidden">
              <span
                aria-hidden="true"
                className="mt-1 h-4 w-4 shrink-0 border border-grade-600 transition-transform group-open:rotate-45"
              >
                <svg viewBox="0 0 16 16" className="h-full w-full text-water-700">
                  <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1.75" fill="none" />
                </svg>
              </span>
              <span>{f.q}</span>
            </summary>
            <div className="pb-5 pl-7 pr-2 text-[0.9375rem] leading-relaxed text-grade-800">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
