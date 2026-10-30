// The seam decoration between the hero photo and the Shop by Category band: a
// thin rule along the join with a double-outlined arch standing on it, echoing
// the arched niches in the courtyard backdrop behind the categories.
//
// It renders as a zero-height block between the two sections, so it takes no
// space in the flow; the arch itself hangs above the seam (bottom edge on the
// join, dome rising into the hero photo) and the rule sits exactly on it.
// z-30 keeps it above both bands — they are positioned siblings with their own
// isolated stacking contexts — while staying under the sticky header's z-50.
export default function SectionJoiner() {
  return (
    <div aria-hidden="true" className="relative z-30 h-0">
      {/* Full-width hairline on the seam, fading out at both edges so the two
          photographs meet with a drawn line instead of a hard cut. */}
      <span className="absolute inset-x-0 top-0 block h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

      {/* Two concentric half-circles: the heavier maroon arc with a lighter
          bronze one inside it, the way a lock-up is framed. viewBox scales the
          whole thing with the width classes below. */}
      <svg
        viewBox="0 0 192 100"
        preserveAspectRatio="xMidYMax meet"
        className="absolute left-1/2 top-0 h-14 w-28 -translate-x-1/2 -translate-y-full sm:h-20 sm:w-40 lg:h-24 lg:w-48"
      >
        <path
          d="M2 99 A94 94 0 0 1 190 99"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-primary/70"
        />
        <path
          d="M16 99 A80 80 0 0 1 176 99"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="stroke-accent/55"
        />
      </svg>
    </div>
  );
}