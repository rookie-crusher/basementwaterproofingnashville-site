import manifest from '@/data/image-manifest.json';

type Entry = {
  width: number;
  height: number;
  /** Direct external URL — used when optimised webp/avif srcsets are not yet generated. */
  src?: string;
  webp?: { w: number; h: number; src: string }[];
  avif?: { w: number; h: number; src: string }[];
};

const images = manifest as unknown as Record<string, Entry>;

/**
 * Static-export replacement for next/image.
 *
 * Emits <picture> with AVIF then WebP sources, a full srcset, and explicit
 * width/height so nothing shifts while loading. Images below the fold get
 * loading="lazy" + decoding="async"; the LCP image should pass priority.
 *
 * Alt text is REQUIRED, not optional.
 *
 * An unknown name renders nothing at all. A visitor must never be shown a
 * production-authoring note, and a silently absent figure degrades better
 * than a labelled hole in the layout. Missing images surface at build time
 * instead — see `npm run shotlist`.
 */
export function SmartImage({
  name,
  alt,
  sizes = '100vw',
  priority = false,
  className,
  aspect,
}: {
  name: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /**
   * CSS aspect-ratio to lock the rendered box to, e.g. '16 / 9'. Applied as an
   * inline style so a cropped figure reserves the right space from first paint
   * even though the file's intrinsic ratio differs.
   */
  aspect?: string;
}) {
  const entry = images[name];

  // External URL entry — no srcset generated yet, render directly
  if (entry?.src && (!entry.webp || entry.webp.length === 0)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={entry.src}
        alt={alt}
        width={entry.width}
        height={entry.height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={className}
        // No inline height: a caller that sets one through `className` (a
        // fixed-height card thumbnail, say) has to win, or SVG entries end up
        // taller than the raster entries sitting beside them in the same grid.
        style={{
          objectFit: 'cover',
          display: 'block',
          width: '100%',
          ...(aspect ? { aspectRatio: aspect } : null),
        }}
      />
    );
  }

  if (!entry) return null;

  const srcset = (list: { w: number; h: number; src: string }[]) =>
    list.map((v) => `${v.src} ${v.w}w`).join(', ');
  const fallback = entry.webp![entry.webp!.length - 1];

  return (
    <picture style={{ display: 'block' }}>
      <source type="image/avif" srcSet={srcset(entry.avif!)} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(entry.webp!)} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallback.src}
        alt={alt}
        width={entry.width}
        height={entry.height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={className}
        style={aspect ? { aspectRatio: aspect, objectFit: 'cover' } : undefined}
      />
    </picture>
  );
}
