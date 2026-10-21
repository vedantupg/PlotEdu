/**
 * Landing hero visual (PRD §6 "Visuals that teach"): a plot is traced, the road
 * widens, setbacks step in from the new boundary, and the buildable footprint
 * fills. Each step is <= 400ms, staged with delays; static under reduced motion.
 * Pure SVG + CSS, so it is crisp at any zoom and costs no JS.
 */
export function PlotStory({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <svg
        viewBox="0 0 360 300"
        role="img"
        aria-labelledby="plot-story-title plot-story-desc"
        className="h-auto w-full overflow-visible"
      >
        <title id="plot-story-title">How regulations shape a building</title>
        <desc id="plot-story-desc">
          A rectangular plot faces a road. The road is widened into the plot, front and side setbacks are measured from
          the new boundary, and what remains is the buildable footprint.
        </desc>
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--accent)" strokeWidth="1" opacity="0.55" />
          </pattern>
          <style>{`
            .ps-trace { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); animation: plot-trace 400ms var(--ease-out-plot) forwards; }
            .ps-in { opacity: 0; animation: fade-up 300ms var(--ease-out-plot) forwards; }
            .ps-widen { transform-box: fill-box; transform-origin: bottom; transform: scaleY(0.5); animation: ps-widen 400ms var(--ease-out-plot) forwards; }
            .ps-fill { opacity: 0; animation: ps-fill 400ms var(--ease-out-plot) forwards; }
            @keyframes ps-widen { to { transform: scaleY(1); } }
            @keyframes ps-fill { to { opacity: 1; } }
            @media (prefers-reduced-motion: reduce) {
              .ps-trace { stroke-dashoffset: 0; }
              .ps-in, .ps-fill { opacity: 1; }
              .ps-widen { transform: none; }
            }
          `}</style>
        </defs>

        {/* Plot boundary */}
        <rect
          x="40"
          y="20"
          width="280"
          height="200"
          fill="none"
          stroke="var(--fg)"
          strokeWidth="1.5"
          className="ps-trace"
          style={{ ["--len" as string]: 960 }}
        />
        <text x="48" y="36" className="survey" fill="var(--muted)" fontSize="9">
          PLOT NO. 01
        </text>

        {/* Road: existing width, then widened into the plot */}
        <rect x="0" y="236" width="360" height="40" fill="var(--surface-3)" />
        <rect
          x="0"
          y="200"
          width="360"
          height="36"
          fill="var(--surface-3)"
          className="ps-widen"
          style={{ animationDelay: "500ms" }}
        />
        <line x1="0" y1="256" x2="360" y2="256" stroke="var(--muted)" strokeDasharray="10 8" strokeWidth="1" />
        <g className="ps-in" style={{ animationDelay: "750ms" }}>
          <line x1="340" y1="200" x2="340" y2="276" stroke="var(--accent)" strokeWidth="1" />
          <line x1="334" y1="200" x2="346" y2="200" stroke="var(--accent)" strokeWidth="1" />
          <line x1="334" y1="276" x2="346" y2="276" stroke="var(--accent)" strokeWidth="1" />
          <text x="252" y="292" fill="var(--accent)" fontSize="9" className="survey">
            ROAD 9 M → 12 M
          </text>
        </g>

        {/* Setbacks measured from the new boundary */}
        <g className="ps-in" style={{ animationDelay: "1050ms" }}>
          <rect
            x="72"
            y="48"
            width="216"
            height="128"
            fill="none"
            stroke="var(--fg)"
            strokeOpacity="0.7"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          {/* front setback dimension */}
          <line x1="180" y1="176" x2="180" y2="200" stroke="var(--muted)" strokeWidth="1" />
          <line x1="174" y1="176" x2="186" y2="176" stroke="var(--muted)" strokeWidth="1" />
          <line x1="174" y1="200" x2="186" y2="200" stroke="var(--muted)" strokeWidth="1" />
          <text x="190" y="192" fill="var(--muted)" fontSize="8.5" className="survey">
            FRONT SETBACK
          </text>
          {/* side setback dimension */}
          <line x1="40" y1="112" x2="72" y2="112" stroke="var(--muted)" strokeWidth="1" />
          <line x1="40" y1="106" x2="40" y2="118" stroke="var(--muted)" strokeWidth="1" />
          <line x1="72" y1="106" x2="72" y2="118" stroke="var(--muted)" strokeWidth="1" />
        </g>

        {/* Buildable footprint */}
        <g className="ps-fill" style={{ animationDelay: "1400ms" }}>
          <rect x="72" y="48" width="216" height="128" fill="url(#hatch)" />
          <rect x="72" y="48" width="216" height="128" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
          <rect x="140" y="98" width="80" height="22" fill="var(--ink)" />
          <text x="180" y="113" textAnchor="middle" fill="var(--accent)" fontSize="10" className="survey">
            BUILDABLE
          </text>
        </g>
      </svg>
      <figcaption className="survey mt-3 text-muted">Fig. 01 — Regulations shape the building</figcaption>
    </figure>
  );
}
