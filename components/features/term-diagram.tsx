import type { DiagramKind } from "@/lib/content/glossary";

/** Small explainer diagrams for key glossary terms. Line-art, brand tokens only. */
export function TermDiagram({ kind, className }: { kind: DiagramKind; className?: string }) {
  const stroke = { stroke: "var(--fg)", strokeWidth: 1.25, fill: "none" } as const;
  const accent = { stroke: "var(--accent)", strokeWidth: 1.5, fill: "none" } as const;
  const label = { fill: "var(--muted)", fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.1em" } as const;

  const body = (() => {
    switch (kind) {
      case "fsi":
        return (
          <>
            <rect x="10" y="70" width="140" height="14" {...stroke} />
            <text x="12" y="96" {...label}>
              PLOT 1,000 M²
            </text>
            <rect x="26" y="52" width="74" height="18" {...accent} />
            <rect x="26" y="34" width="74" height="18" {...accent} />
            <rect x="26" y="16" width="74" height="18" {...accent} opacity="0.5" strokeDasharray="3 3" />
            <text x="106" y="47" {...label} fill="var(--accent)">
              Σ FLOORS
            </text>
          </>
        );
      case "setback":
      case "envelope":
        return (
          <>
            <rect x="10" y="8" width="140" height="80" {...stroke} />
            <rect
              x="34"
              y="24"
              width="92"
              height="48"
              {...accent}
              strokeDasharray={kind === "setback" ? "4 3" : undefined}
            />
            <line x1="80" y1="72" x2="80" y2="88" stroke="var(--muted)" />
            <text x="84" y="84" {...label}>
              FRONT
            </text>
            {kind === "envelope" ? (
              <rect x="34" y="24" width="92" height="48" fill="var(--accent)" opacity="0.12" />
            ) : null}
          </>
        );
      case "road":
        return (
          <>
            <rect x="10" y="8" width="140" height="56" {...stroke} />
            <rect x="0" y="64" width="160" height="28" fill="var(--surface-3)" />
            <rect x="0" y="56" width="160" height="8" fill="var(--accent)" opacity="0.35" />
            <text x="8" y="82" {...label}>
              ROAD WIDTH
            </text>
          </>
        );
      case "tdr":
        return (
          <>
            <rect x="8" y="30" width="56" height="50" {...stroke} />
            <rect x="96" y="30" width="56" height="50" {...stroke} />
            <rect x="104" y="14" width="40" height="16" {...accent} />
            <path d="M68 55h24M86 50l6 5-6 5" {...accent} />
            <text x="8" y="94" {...label}>
              SURRENDER
            </text>
            <text x="100" y="94" {...label}>
              RECEIVE
            </text>
          </>
        );
      case "plot":
        return (
          <>
            <rect x="20" y="10" width="120" height="76" {...stroke} />
            {[
              [16, 6],
              [136, 6],
              [16, 82],
              [136, 82],
            ].map(([x, y]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill="var(--accent)" />
            ))}
            <text x="28" y="26" {...label}>
              PLOT NO. 01
            </text>
          </>
        );
    }
  })();

  return (
    <svg viewBox="0 0 160 100" className={className} aria-hidden>
      {body}
    </svg>
  );
}
