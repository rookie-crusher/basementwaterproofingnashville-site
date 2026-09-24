import { site, telHref } from '@/data/site';
import { cx } from '@/lib/util';

/**
 * The single most important element on the site — the primary conversion goal
 * is phone calls. Never render a phone number as plain text; always tel:.
 */
export function CallButton({
  variant = 'primary',
  className,
  label,
}: {
  variant?: 'primary' | 'secondary';
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={telHref}
      className={cx(variant === 'primary' ? 'cta-primary' : 'cta-secondary', className)}
      data-conversion="call"
      aria-label={`Call ${site.brand} at ${site.phone.display}`}
    >
      <PhoneIcon />
      <span>{label ?? `Call ${site.phone.display}`}</span>
    </a>
  );
}

export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cx('h-[1.1em] w-[1.1em] shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
