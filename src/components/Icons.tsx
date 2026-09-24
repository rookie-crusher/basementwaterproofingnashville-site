import { cx } from '@/lib/util';

/**
 * ICON SET
 *
 * Solid glyphs on a 24-unit grid, drawn to sit at the same optical weight as
 * Archivo's heavy weights. The previous set was 1.75px stroke line-art, which
 * disappeared against photography and against the dark sections — a filled
 * mark holds at the 20px sizes the quick-link strip and badge rows use.
 *
 * Every glyph inherits `currentColor` and carries no intrinsic colour, so a
 * parent decides whether it reads as accent, white or muted.
 */

export type IconName =
  | 'droplet'
  | 'house'
  | 'layers'
  | 'calendar'
  | 'star'
  | 'pin'
  | 'book'
  | 'shield'
  | 'search'
  | 'clipboard'
  | 'phone'
  | 'level'
  | 'stamp'
  | 'check';

const paths: Record<IconName, React.ReactNode> = {
  // Water intrusion — the thing the whole site is about
  droplet: <path d="M12 2.2c4.2 5 6.6 8.4 6.6 11.4A6.6 6.6 0 0 1 12 20.2a6.6 6.6 0 0 1-6.6-6.6c0-3 2.4-6.4 6.6-11.4Zm-1.7 8.2c-1.5 1.4-2.3 2.8-2.3 4.1a1 1 0 0 0 2 0c0-.6.5-1.5 1.7-2.6a1 1 0 0 0-1.4-1.5Z" />,

  // Structure above grade
  house: <path d="M12 2.6 1.8 10.4a1 1 0 0 0 1.2 1.6l.6-.4v8.6a1 1 0 0 0 1 1h5v-6h4.8v6h5a1 1 0 0 0 1-1v-8.6l.6.4a1 1 0 0 0 1.2-1.6L12 2.6Z" />,

  // Soil / rock strata — the geology argument
  layers: (
    <>
      <path d="M12 2.4 1.6 7.3a.8.8 0 0 0 0 1.4L12 13.6l10.4-4.9a.8.8 0 0 0 0-1.4L12 2.4Z" />
      <path d="M2.9 11.6.9 12.5a.8.8 0 0 0 0 1.4L12 19.1l11.1-5.2a.8.8 0 0 0 0-1.4l-2-.9-8.4 3.9a1.6 1.6 0 0 1-1.4 0l-8.4-3.9Z" opacity=".55" />
      <path d="M2.9 16.5.9 17.4a.8.8 0 0 0 0 1.4L12 24l11.1-5.2a.8.8 0 0 0 0-1.4l-2-.9-8.4 3.9a1.6 1.6 0 0 1-1.4 0l-8.4-3.9Z" opacity=".3" />
    </>
  ),

  // Booking the visit
  calendar: (
    <>
      <path d="M7 1.8a1 1 0 0 1 1 1V4h8V2.8a1 1 0 1 1 2 0V4h1.4A1.6 1.6 0 0 1 21 5.6V8H3V5.6A1.6 1.6 0 0 1 4.6 4H6V2.8a1 1 0 0 1 1-1Z" />
      <path d="M3 9.8h18v10.6a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 20.4V9.8Zm4 3a1 1 0 0 0 0 2h2a1 1 0 1 0 0-2H7Zm6 0a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2h-4Zm-6 4a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H7Z" />
    </>
  ),

  star: <path d="m12 2.4 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.3l-5.9 3.1 1.2-6.5L2.5 9.3l6.6-.9 2.9-6Z" />,

  pin: <path d="M12 1.9a7.6 7.6 0 0 0-7.6 7.6c0 5.4 6.6 12 6.9 12.3a1 1 0 0 0 1.4 0c.3-.3 6.9-6.9 6.9-12.3A7.6 7.6 0 0 0 12 1.9Zm0 10.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />,

  book: <path d="M4.4 2.4h11.2A2.4 2.4 0 0 1 18 4.8v16.4a.8.8 0 0 1-1.2.7l-4.8-2.7-4.8 2.7A.8.8 0 0 1 6 21.2V4.8H4.4a.8.8 0 0 1 0-1.6ZM8 4.8v14l3.6-2a.8.8 0 0 1 .8 0l4 2.2V4.8a.8.8 0 0 0-.8-.8H7.6c.3.4.4.8.4 1.2v-.4Z" />,

  shield: <path d="M12 1.8 3.8 4.6v6.6c0 4.8 3.3 9.2 8.2 10.9 4.9-1.7 8.2-6.1 8.2-10.9V4.6L12 1.8Zm4.3 7.5-5 5.3a1 1 0 0 1-1.5 0L7.7 12.3a1 1 0 0 1 1.4-1.4l1.4 1.5 4.3-4.5a1 1 0 1 1 1.5 1.4Z" />,

  search: <path d="M10.6 2.4a8.2 8.2 0 1 1-4.9 14.8l-2.6 2.6a1.2 1.2 0 0 1-1.7-1.7l2.6-2.6a8.2 8.2 0 0 1 6.6-13.1Zm0 2.4a5.8 5.8 0 1 0 0 11.6 5.8 5.8 0 0 0 0-11.6Z" />,

  clipboard: (
    <>
      <path d="M9.4 1.8h5.2a1.4 1.4 0 0 1 1.4 1.4v1.2H8V3.2a1.4 1.4 0 0 1 1.4-1.4Z" />
      <path d="M6 3.6h.4v1.6a1.4 1.4 0 0 0 1.4 1.4h8.4a1.4 1.4 0 0 0 1.4-1.4V3.6H18a1.8 1.8 0 0 1 1.8 1.8v14.8A1.8 1.8 0 0 1 18 22H6a1.8 1.8 0 0 1-1.8-1.8V5.4A1.8 1.8 0 0 1 6 3.6Zm2.4 7a1 1 0 0 0 0 2h7.2a1 1 0 1 0 0-2H8.4Zm0 4a1 1 0 1 0 0 2h4.8a1 1 0 1 0 0-2H8.4Z" />
    </>
  ),

  phone: <path d="M4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.4 1.8.6 2.8.7A2 2 0 0 1 22 17v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2Z" />,

  // Spirit level — grade and slope. The vial is drawn as a knocked-out oval
  // with a bubble in it; without that detail the glyph reads as a plain dash
  // at 24px, which is what the first cut of this set did.
  level: (
    <>
      <path d="M2.2 7.6h19.6a1.6 1.6 0 0 1 1.6 1.6v5.6a1.6 1.6 0 0 1-1.6 1.6H2.2A1.6 1.6 0 0 1 .6 14.8V9.2a1.6 1.6 0 0 1 1.6-1.6Zm7 2.6a1.2 1.2 0 0 0-1.2 1.2v1.2a1.2 1.2 0 0 0 1.2 1.2h5.6a1.2 1.2 0 0 0 1.2-1.2v-1.2a1.2 1.2 0 0 0-1.2-1.2H9.2Zm-5 0a1 1 0 0 0 0 2h1.4a1 1 0 1 0 0-2H4.2Zm14.2 0a1 1 0 1 0 0 2h1.4a1 1 0 1 0 0-2h-1.4Z" />
      <circle cx="13.4" cy="12" r="1.1" fill="#fff" />
    </>
  ),

  // Permit stamp: handle, body, and the line it has been pressed onto
  stamp: (
    <>
      <path d="M12 1.8a3.8 3.8 0 0 0-3.7 4.7l.9 3.7H8a3.4 3.4 0 0 0-3.4 3.4v1.2h14.8v-1.2A3.4 3.4 0 0 0 16 10.2h-1.2l.9-3.7A3.8 3.8 0 0 0 12 1.8Z" />
      <rect x="3.4" y="17" width="17.2" height="2.6" rx="1.1" />
      <rect x="5.6" y="21" width="12.8" height="1.6" rx=".8" opacity=".5" />
    </>
  ),

  check: <path d="M21.2 5.6a1.4 1.4 0 0 1 0 2L10.4 18.4a1.4 1.4 0 0 1-2 0l-5.6-5.6a1.4 1.4 0 0 1 2-2l4.6 4.6 9.8-9.8a1.4 1.4 0 0 1 2 0Z" />,
};

export function Icon({
  name,
  className,
  title,
}: {
  name: IconName;
  className?: string;
  /** Supply only when the glyph carries meaning no adjacent text repeats. */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cx('h-6 w-6 shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {paths[name]}
    </svg>
  );
}
