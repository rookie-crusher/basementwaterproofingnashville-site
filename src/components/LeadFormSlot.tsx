import { leadForm, requestedFields } from '@/data/lead-form';
import { site } from '@/data/site';
import { CallButton } from './CallButton';

/**
 * LEAD FORM SLOT
 *
 * Renders whatever src/data/lead-form.ts is configured for, so the embed lives
 * in exactly one place and every page picks it up.
 *
 * The iframe is fluid up to the provider's native 600px (see .lead-embed in
 * globals.css) because a hard 600px width overflows a phone viewport. It is
 * also loading="lazy": above-the-fold instances load immediately anyway, while
 * the instances further down the page stay off the critical path.
 */
export function LeadFormSlot({ heading, sub }: { heading?: string; sub?: string }) {
  return (
    <section
      id="request-inspection"
      aria-labelledby="request-inspection-heading"
      className="scroll-mt-24 border border-limestone-300 bg-limestone-50 p-5 sm:p-6"
    >
      <p className="eyebrow">Free on-site diagnosis</p>
      <h2 id="request-inspection-heading" className="mt-2 font-display text-2xl font-bold">
        {heading ?? 'Find out where the water is getting in'}
      </h2>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-grade-800">
        {sub ??
          'We diagnose the water path before quoting. No obligation, and no quote over the phone for work we have not looked at.'}
      </p>

      <div className="mt-5">
        <FormBody />
      </div>

      <div className="mt-5 border-t border-limestone-200 pt-4">
        <p className="spec text-xs text-grade-600">
          Prefer to talk to someone? Call {site.phone.display} — {site.emergencyNote.toLowerCase()}.
        </p>
      </div>
    </section>
  );
}

function FormBody() {
  if (leadForm.mode === 'iframe') {
    return (
      <iframe
        src={leadForm.src}
        title={leadForm.title}
        loading="lazy"
        className="lead-embed"
        style={
          {
            '--lead-h': `${leadForm.height}px`,
            '--lead-h-mobile': `${leadForm.mobileHeight}px`,
          } as React.CSSProperties
        }
      />
    );
  }

  if (leadForm.mode === 'raw') {
    return <div dangerouslySetInnerHTML={{ __html: leadForm.html }} />;
  }

  // No embed configured. Fall back to the phone rather than to anything that
  // reads like an unfinished page — the call converts better than the form
  // anyway, and a visitor should never learn that a slot is empty.
  return (
    <div>
      <div className="border border-limestone-300 bg-water-100/40 p-5">
        <p className="text-sm leading-relaxed text-grade-800">
          Tell us what you are seeing and where, and we will book the on-site diagnosis. Have this
          ready and the call takes two minutes:
        </p>
        <ul className="mt-3 grid gap-1 spec text-xs text-grade-600 sm:grid-cols-2">
          {requestedFields.map((f) => (
            <li key={f}>&middot; {f}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <CallButton className="w-full" label={`Call now — ${site.phone.display}`} />
      </div>
    </div>
  );
}
