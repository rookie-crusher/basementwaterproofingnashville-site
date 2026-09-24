import { site } from '@/data/site';
import { Icon } from './Icons';

/**
 * Trust signals. Each badge only renders when the underlying claim in
 * site.ts is actually true — "Licensed & Insured" is regulated advertising
 * language in Tennessee, and an unbacked badge is a liability, not a
 * conversion lever. Fill in site.credentials to light these up.
 */
export function TrustBadges({ compact = false }: { compact?: boolean }) {
  const c = site.credentials;

  const badges: { label: string; sub?: string }[] = [];
  if (c.tnLicense) badges.push({ label: 'Licensed', sub: `TN #${c.tnLicense}` });
  if (c.insured) badges.push({ label: 'Insured', sub: 'Liability & workers comp' });
  if (c.warrantyYears)
    badges.push({ label: `${c.warrantyYears}-year warranty`, sub: 'Transferable to new owners' });
  if (c.yearsInBusiness)
    badges.push({ label: `${c.yearsInBusiness} years`, sub: 'Serving Middle Tennessee' });
  if (c.bbbAccredited) badges.push({ label: 'BBB accredited', sub: 'Better Business Bureau' });

  // Always-true operational claims
  badges.push({ label: 'Free diagnosis', sub: 'On-site, no obligation' });
  badges.push({ label: 'Written scope', sub: 'Before any work begins' });

  return (
    <ul
      /*
        Bordered cells rather than a gap-px grid over a coloured background:
        the badge count is odd, so the old treatment left the final row's empty
        cell showing as a stray filled rectangle.
      */
      className={
        compact
          ? 'flex flex-wrap gap-x-5 gap-y-2 spec text-grade-600'
          : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'
      }
    >
      {badges.map((b) =>
        compact ? (
          <li key={b.label} className="flex items-center gap-1.5">
            <CheckMark />
            {b.label}
          </li>
        ) : (
          <li key={b.label} className="border border-limestone-300 bg-limestone-50 p-4">
            <div className="flex items-center gap-2 font-display text-sm font-extrabold">
              <CheckMark />
              {b.label}
            </div>
            {b.sub && <p className="mt-1 spec text-xs text-grade-600">{b.sub}</p>}
          </li>
        ),
      )}
    </ul>
  );
}

function CheckMark() {
  return <Icon name="check" className="h-3.5 w-3.5 text-water-500" />;
}

/**
 * Association logos (BBB, NAWSRC, Chamber of Commerce). Renders nothing while
 * the list is empty, so the section simply does not appear rather than showing
 * an empty strip. Add a logo here only once the affiliation is current and the
 * mark is licensed for display.
 */
export function AssociationLogos() {
  const logos: { src: string; alt: string; width: number; height: number }[] = [
    // { src: '/logos/bbb.svg', alt: 'Better Business Bureau accredited business', width: 120, height: 48 },
  ];
  if (!logos.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-8 opacity-70">
      {logos.map((l) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={l.src} src={l.src} alt={l.alt} width={l.width} height={l.height} loading="lazy" />
      ))}
    </div>
  );
}
