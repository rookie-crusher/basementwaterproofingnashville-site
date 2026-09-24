import { cx } from '@/lib/util';

/**
 * The guarantee seal.
 *
 * Drawn rather than shipped as a raster badge: it has to sit beside heavy
 * Archivo text at anything from 96px to 200px, and a starburst PNG goes soft
 * at the top of that range while costing more bytes than the whole section.
 * Colours come from the palette so it cannot drift out of step with the rest
 * of the site the way a flattened image would.
 */
export function GuaranteeSeal({ className }: { className?: string }) {
  // 24 points, alternating radius — the classic starburst rosette.
  const points = Array.from({ length: 48 }, (_, i) => {
    const angle = (i / 48) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 100 : 88;
    return `${(100 + r * Math.cos(angle)).toFixed(2)},${(100 + r * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');

  return (
    <svg
      viewBox="0 0 200 200"
      className={cx('h-auto w-full', className)}
      role="img"
      aria-label="100 percent satisfaction guarantee"
    >
      <polygon points={points} fill="var(--color-water-700)" />
      <circle cx="100" cy="100" r="80" fill="var(--color-water-500)" />
      <circle cx="100" cy="100" r="72" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity=".7" />

      <text
        x="100"
        y="78"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="var(--font-display)"
        fontSize="17"
        fontWeight="800"
        letterSpacing="2.4"
      >
        GUARANTEED
      </text>

      <text
        x="100"
        y="122"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="var(--font-display)"
        fontSize="42"
        fontWeight="800"
        letterSpacing="-1"
      >
        100%
      </text>

      <text
        x="100"
        y="146"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="var(--font-display)"
        fontSize="15"
        fontWeight="700"
        letterSpacing="2"
      >
        IN WRITING
      </text>
    </svg>
  );
}
