import { site, telHref } from '@/data/site';
import { PhoneIcon } from './CallButton';

/**
 * Mobile sticky footer CTA. Hidden on desktop, where the header CTA is always
 * visible. Uses env(safe-area-inset-bottom) so it clears the iOS home bar.
 *
 * No JavaScript — pure CSS positioning. A sticky bar that costs zero JS is the
 * difference between a 95 and an 88 mobile PageSpeed score.
 */
export function StickyCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-grade-800 bg-grade-950/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch gap-2 p-2">
        <a
          href={telHref}
          className="cta-primary flex-1"
          data-conversion="call-sticky"
          aria-label={`Call ${site.brand} at ${site.phone.display}`}
        >
          <PhoneIcon />
          <span>{site.phone.display}</span>
        </a>
        <a
          href="#request-inspection"
          className="flex min-h-[3.25rem] items-center justify-center rounded-[2px] border border-grade-400 px-4 font-display font-semibold text-limestone-100"
        >
          Get a quote
        </a>
      </div>
    </div>
  );
}
