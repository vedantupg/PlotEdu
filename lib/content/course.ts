/**
 * Course 01 content, mirrored from the launch poster.
 * Used to generate supabase/seed.sql and as the static fallback for public pages.
 */

export type ModuleSeed = {
  order: number;
  slug: string;
  title: string;
  summary: string;
};

export type CourseSeed = {
  slug: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  outcomes: readonly string[];
  modules: readonly ModuleSeed[];
  batch: {
    name: string;
    startsLabel: string;
    durationLabel: string;
    capacity: number;
  };
};

export const COURSE_ONE: CourseSeed = {
  slug: "practical-udcpr",
  code: "COURSE 01",
  title: "Practical UDCPR & Development Permission",
  subtitle: "A Complete Foundation Course for Practicing Architects & Graduates",
  description:
    "Bridging the gap between theoretical knowledge and practical industry experience. Read the plot first, the regulation second, and design third — the way projects actually move through approval in Maharashtra.",
  outcomes: [
    "UDCPR rules & regulations",
    "FSI & parking calculations",
    "Plot subdivision & layouts",
    "Development permissions",
    "Building plan sanctioning",
    "Handling real projects",
  ],
  modules: [
    {
      order: 1,
      slug: "foundation",
      title: "Foundation",
      summary: "Plots, land records, zoning and how a Development Plan shapes what can be built.",
    },
    {
      order: 2,
      slug: "udcpr",
      title: "UDCPR",
      summary: "FSI, TDR, setbacks, parking and the regulations that define a building envelope.",
    },
    {
      order: 3,
      slug: "practical-planning",
      title: "Practical Planning",
      summary: "Layouts, subdivision, amenity and open-space provisions worked on real plots.",
    },
    {
      order: 4,
      slug: "professional-practice",
      title: "Professional Practice",
      summary: "Permissions, NOCs, sanction drawings and handling a project end to end.",
    },
  ],
  batch: {
    name: "November 2026",
    startsLabel: "November 2026",
    durationLabel: "3 Weeks",
    capacity: 25,
  },
};

export const FORUM_GENERAL_CATEGORY = { slug: "general", name: "General" } as const;
