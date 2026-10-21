import type { ReactNode, SVGProps } from "react";

/**
 * PlotEdu line glyphs: one stroke weight (1.5), square caps, 24px grid.
 * Drawn to read like plan-sheet symbols rather than a generic icon pack.
 */
type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Glyph({ title, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Home: a plot with a footprint inside it. */
export const IconHome = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" />
    <path d="M8 20.5V12l4-3.5 4 3.5v8.5" />
  </Glyph>
);

/** Session: calendar sheet with a marked slot. */
export const IconSession = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    <rect x="12.5" y="13" width="4" height="3.5" fill="currentColor" stroke="none" />
  </Glyph>
);

/** Note: a drawing sheet with a folded title block. */
export const IconNote = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M5.5 3.5h9l4 4v13h-13z" />
    <path d="M14.5 3.5v4h4M8.5 12h7M8.5 15.5h7M8.5 19h4" />
  </Glyph>
);

/** Doubt: speech outline with a question tick. */
export const IconDoubt = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3.5 4.5h17v12h-9l-4.5 3.5v-3.5h-3.5z" />
    <path d="M10 8.6c.3-1 1.1-1.6 2.1-1.6 1.2 0 2.1.8 2.1 1.9 0 1.6-2.2 1.7-2.2 3.1" />
    <path d="M12 14.2v.1" strokeWidth={2} />
  </Glyph>
);

/** Glossary: an open register with a bookmark. */
export const IconGlossary = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 6.5c-2-1.7-5-2-8.5-2v14c3.5 0 6.5.3 8.5 2 2-1.7 5-2 8.5-2v-14c-3.5 0-6.5.3-8.5 2z" />
    <path d="M12 6.5v14" />
  </Glyph>
);

/** Plot: boundary with corner markers. */
export const IconPlot = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="5" y="5" width="14" height="14" strokeDasharray="2 2" />
    <rect x="3.5" y="3.5" width="3" height="3" fill="currentColor" stroke="none" />
    <rect x="17.5" y="3.5" width="3" height="3" fill="currentColor" stroke="none" />
    <rect x="3.5" y="17.5" width="3" height="3" fill="currentColor" stroke="none" />
    <rect x="17.5" y="17.5" width="3" height="3" fill="currentColor" stroke="none" />
  </Glyph>
);

export const IconLock = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="5" y="10.5" width="14" height="10" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2" />
  </Glyph>
);

export const IconSearch = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l5.5 5.5" />
  </Glyph>
);

export const IconArrowRight = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4 12h15M14 7l5 5-5 5" />
  </Glyph>
);

export const IconDownload = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4 20.5h16" />
  </Glyph>
);

export const IconCalendarPlus = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4M12 12.5v5M9.5 15h5" />
  </Glyph>
);

export const IconVideo = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3" y="6.5" width="12.5" height="11" />
    <path d="M15.5 10.5l5.5-3v9l-5.5-3" />
  </Glyph>
);

export const IconShield = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z" />
    <path d="M8.75 12l2.25 2.25 4.25-4.5" />
  </Glyph>
);

export const IconCheck = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4.5 12.5l5 5 10-11" />
  </Glyph>
);

export const IconClose = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
  </Glyph>
);

/** Setback: plot edge with an inner building line and dimension ticks. */
export const IconSetback = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" />
    <rect x="8" y="8" width="8" height="8" strokeDasharray="2 1.5" />
    <path d="M3.5 12H8M3.5 10.5v3M8 10.5v3" />
  </Glyph>
);

/** FSI: stacked floor plates over a plot. */
export const IconFsi = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3.5 20.5h17" />
    <rect x="7" y="13.5" width="10" height="4" />
    <rect x="7" y="8.5" width="10" height="5" />
    <rect x="7" y="4" width="10" height="4.5" />
  </Glyph>
);

export const IconSun = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
  </Glyph>
);

export const IconMoon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />
  </Glyph>
);

export const IconMonitor = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3" y="4.5" width="18" height="12" />
    <path d="M8.5 20h7M12 16.5V20" />
  </Glyph>
);

export const IconGoogle = (p: IconProps) => (
  <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden {...p}>
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"
    />
    <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8z" />
    <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
  </svg>
);
