/**
 * FoundationSection — the site's signature element.
 *
 * A section drawing of the actual failure mechanism in Middle Tennessee:
 * rainwater cannot percolate through shallow limestone, so it perches on the
 * soil/rock contact and travels laterally into the foundation. This is the
 * thesis of the whole business, drawn once, in the vernacular of the trade.
 *
 * Pure inline SVG: no image request, no layout shift, scales to any width,
 * and the animation is a single transform that respects reduced-motion via
 * the global media query in globals.css.
 */
export function FoundationSection({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 420"
      className={className}
      role="img"
      aria-labelledby="fs-title fs-desc"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="fs-title">
        Section drawing of a Middle Tennessee foundation showing lateral water flow
      </title>
      <desc id="fs-desc">
        Rainwater soaks through thin topsoil, reaches shallow limestone bedrock which it cannot
        pass through, then travels sideways along that contact until it reaches the foundation
        wall, where it enters at the joint between the wall and the footing.
      </desc>

      <defs>
        {/* Bedrock hatch — the drawing convention for rock in a section */}
        <pattern id="rock" width="14" height="14" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="14" stroke="var(--color-grade-600)" strokeWidth="1.2" />
        </pattern>
        {/* Soil stipple */}
        <pattern id="soil" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="3" r="0.9" fill="var(--color-grade-400)" opacity="0.55" />
          <circle cx="7" cy="8" r="0.7" fill="var(--color-grade-400)" opacity="0.4" />
        </pattern>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-water-500)" />
        </marker>
        <marker id="arrowRain" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-water-300)" />
        </marker>
      </defs>

      {/* ── SOIL MASS (sloping grade, high on the left) ─────────────────── */}
      <path d="M0 150 C 120 128, 260 138, 400 162 L 640 176 L 640 300 L 0 300 Z" fill="var(--color-limestone-200)" />
      <path d="M0 150 C 120 128, 260 138, 400 162 L 640 176 L 640 300 L 0 300 Z" fill="url(#soil)" />

      {/* ── BEDROCK ────────────────────────────────────────────────────── */}
      <path d="M0 300 L 640 300 L 640 420 L 0 420 Z" fill="var(--color-grade-800)" />
      <path d="M0 300 L 640 300 L 640 420 L 0 420 Z" fill="url(#rock)" opacity="0.5" />
      <line x1="0" y1="300" x2="640" y2="300" stroke="var(--color-grade-950)" strokeWidth="2.5" />

      {/* ── GRADE LINE ─────────────────────────────────────────────────── */}
      <path
        d="M0 150 C 120 128, 260 138, 400 162 L 640 176"
        fill="none"
        stroke="var(--color-grade-800)"
        strokeWidth="2.5"
      />

      {/* ── HOUSE ──────────────────────────────────────────────────────── */}
      {/* Above-grade wall + simple roof */}
      <path d="M300 70 L 420 34 L 540 70 Z" fill="var(--color-grade-800)" />
      <rect x="316" y="70" width="208" height="86" fill="var(--color-limestone-50)" stroke="var(--color-grade-800)" strokeWidth="2" />
      <rect x="350" y="96" width="34" height="34" fill="var(--color-water-100)" stroke="var(--color-grade-600)" strokeWidth="1.5" />
      <rect x="456" y="96" width="34" height="34" fill="var(--color-water-100)" stroke="var(--color-grade-600)" strokeWidth="1.5" />

      {/* Below-grade foundation walls */}
      <rect x="316" y="156" width="20" height="128" fill="var(--color-limestone-50)" stroke="var(--color-grade-950)" strokeWidth="2" />
      <rect x="504" y="156" width="20" height="128" fill="var(--color-limestone-50)" stroke="var(--color-grade-950)" strokeWidth="2" />
      {/* Basement floor slab */}
      <rect x="336" y="272" width="168" height="12" fill="var(--color-limestone-200)" stroke="var(--color-grade-950)" strokeWidth="1.5" />
      {/* Footings */}
      <rect x="306" y="284" width="40" height="16" fill="var(--color-limestone-300)" stroke="var(--color-grade-950)" strokeWidth="1.5" />
      <rect x="494" y="284" width="40" height="16" fill="var(--color-limestone-300)" stroke="var(--color-grade-950)" strokeWidth="1.5" />
      {/* Interior space label */}
      <text x="420" y="240" textAnchor="middle" className="fill-grade-600" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="1.5">
        BELOW GRADE
      </text>

      {/* ── RAIN infiltrating ──────────────────────────────────────────── */}
      <g strokeWidth="1.6" stroke="var(--color-water-300)" markerEnd="url(#arrowRain)">
        <line x1="60" y1="96" x2="60" y2="140" />
        <line x1="112" y1="80" x2="112" y2="124" />
        <line x1="168" y1="98" x2="168" y2="134" />
        <line x1="224" y1="82" x2="224" y2="128" />
      </g>

      {/* ── WATER TABLE / PERCHED WATER (animated) ─────────────────────── */}
      <g className="water-drift">
        <path
          d="M0 262 Q 80 254, 160 262 T 306 262"
          fill="none"
          stroke="var(--color-water-500)"
          strokeWidth="2.5"
        />
        <path
          d="M0 262 Q 80 254, 160 262 T 306 262 L 306 300 L 0 300 Z"
          fill="var(--color-water-500)"
          opacity="0.18"
        />
      </g>

      {/* ── LATERAL FLOW along the rock contact — the key mechanism ─────── */}
      <g stroke="var(--color-water-500)" strokeWidth="2.6" fill="none" markerEnd="url(#arrow)">
        <line x1="96" y1="292" x2="188" y2="292" />
        <line x1="188" y1="292" x2="298" y2="292" />
      </g>

      {/* Entry point: the cold joint between wall and footing */}
      <circle cx="316" cy="288" r="13" fill="none" stroke="var(--color-alert-600)" strokeWidth="2.2" />
      <line x1="316" y1="275" x2="316" y2="301" stroke="var(--color-alert-600)" strokeWidth="1" opacity="0.6" />

      {/* ── CALLOUT LABELS ─────────────────────────────────────────────── */}
      <g fontFamily="var(--font-mono)" fontSize="11.5" letterSpacing="1.2" className="fill-grade-800">
        {/* Grade */}
        <line x1="596" y1="176" x2="596" y2="196" stroke="var(--color-grade-600)" strokeWidth="1" />
        <text x="596" y="210" textAnchor="end">GRADE</text>

        {/* Bedrock */}
        <text x="24" y="330" className="fill-limestone-100">LIMESTONE BEDROCK</text>
        <text x="24" y="348" className="fill-grade-400" fontSize="10">
          IMPERMEABLE — WATER TURNS SIDEWAYS
        </text>

        {/* Water table */}
        <text x="24" y="248" className="fill-water-700">PERCHED WATER</text>

        {/* Entry point */}
        <line x1="316" y1="288" x2="252" y2="212" stroke="var(--color-alert-600)" strokeWidth="1" />
        <text x="248" y="204" textAnchor="end" className="fill-alert-600">ENTRY: COLD JOINT</text>
      </g>
    </svg>
  );
}
