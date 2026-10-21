/**
 * Seed glossary. Definitions are deliberately general; Kajal should verify
 * clause-level references against the current UDCPR notification before launch.
 */

export type DiagramKind = "fsi" | "setback" | "envelope" | "road" | "tdr" | "plot";

export type GlossaryTermSeed = {
  slug: string;
  term: string;
  shortDef: string;
  body: string;
  example?: string;
  sourceRef?: string;
  module: "foundation" | "udcpr" | "practical-planning" | "professional-practice";
  related: readonly string[];
  diagram?: DiagramKind;
};

export const GLOSSARY: readonly GlossaryTermSeed[] = [
  {
    slug: "fsi",
    term: "FSI (Floor Space Index)",
    shortDef: "The ratio of total permissible built-up floor area to the area of the plot.",
    body: "FSI caps how much floor area can be built on a plot across all floors combined. It does not dictate the number of floors on its own: the same FSI can be used as a low, wide building or a taller, slimmer one, subject to setbacks, height limits and ground coverage.",
    example:
      "A 1,000 sq m plot with an FSI of 1.1 allows 1,100 sq m of built-up area in total, whether spread over two floors or five.",
    sourceRef: "UDCPR, Maharashtra",
    module: "udcpr",
    related: ["basic-fsi", "premium-fsi", "tdr", "built-up-area"],
    diagram: "fsi",
  },
  {
    slug: "basic-fsi",
    term: "Basic FSI",
    shortDef: "The FSI permitted on a plot as of right, before any premium, TDR or incentive.",
    body: "Basic FSI is the starting entitlement for a plot. Additional potential, such as premium FSI or TDR, is loaded on top of it within the maximum limits prescribed for the road width and zone.",
    sourceRef: "UDCPR, Maharashtra",
    module: "udcpr",
    related: ["fsi", "premium-fsi", "tdr"],
  },
  {
    slug: "premium-fsi",
    term: "Premium FSI",
    shortDef: "Additional FSI that can be purchased from the planning authority by paying a premium.",
    body: "Premium FSI lets an owner build beyond basic FSI by paying a charge to the authority, typically linked to the ready reckoner rate. Its availability and upper limit depend on the road width the plot abuts.",
    sourceRef: "UDCPR, Maharashtra",
    module: "udcpr",
    related: ["fsi", "basic-fsi", "tdr", "road-width"],
  },
  {
    slug: "tdr",
    term: "TDR (Transferable Development Rights)",
    shortDef: "Development potential separated from one plot and used on another, issued as a certificate.",
    body: "When land is surrendered for a public purpose (such as a road or reservation), the owner can receive TDR instead of cash compensation. The TDR can be sold and loaded on an eligible receiving plot, subject to road-width-based limits.",
    example:
      "An owner surrenders a strip for road widening and receives a Development Right Certificate, which a developer elsewhere buys to add floor area to their project.",
    sourceRef: "UDCPR, Maharashtra",
    module: "udcpr",
    related: ["fsi", "road-widening", "reservation"],
    diagram: "tdr",
  },
  {
    slug: "setback",
    term: "Setback (Marginal Distance)",
    shortDef: "The minimum open distance to be left between the building and the plot boundary.",
    body: "Setbacks keep light, ventilation, fire access and privacy between buildings. Front setbacks usually depend on the road width; side and rear setbacks usually depend on building height.",
    example:
      "On a plot facing a 12 m road, the front marginal distance is measured from the road boundary after any road widening, not from the original plot edge.",
    sourceRef: "UDCPR, Maharashtra",
    module: "udcpr",
    related: ["building-line", "building-envelope", "road-widening"],
    diagram: "setback",
  },
  {
    slug: "building-line",
    term: "Building Line",
    shortDef: "The line up to which the plinth of a building may lawfully extend on the road side.",
    body: "The building line is set back from the road boundary. Nothing except permitted projections may cross it. It is where front setback becomes a physical line on a drawing.",
    sourceRef: "UDCPR, Maharashtra",
    module: "udcpr",
    related: ["setback", "road-widening"],
  },
  {
    slug: "building-envelope",
    term: "Building Envelope",
    shortDef: "The three-dimensional volume inside which a building may be placed on a plot.",
    body: "The envelope is what remains after setbacks, height limits and other controls are applied. Good design starts by drawing the envelope; the building is then planned inside it using the available FSI.",
    sourceRef: "UDCPR, Maharashtra",
    module: "udcpr",
    related: ["setback", "fsi", "ground-coverage"],
    diagram: "envelope",
  },
  {
    slug: "road-width",
    term: "Road Width",
    shortDef: "The width of the road a plot abuts, which drives FSI limits and front setbacks.",
    body: "Many controls step up with road width: maximum permissible FSI, premium and TDR loading, front setbacks and permitted uses. Always confirm the width as per the Development Plan or sanctioned layout, not just site measurement.",
    sourceRef: "UDCPR, Maharashtra",
    module: "foundation",
    related: ["road-widening", "premium-fsi", "setback"],
    diagram: "road",
  },
  {
    slug: "road-widening",
    term: "Road Widening",
    shortDef: "Land from a plot proposed in the Development Plan to be added to an existing road.",
    body: "If a DP proposes widening, part of the plot falls in the road line. That portion is handed over, and setbacks are measured from the new boundary. The surrendered area may earn TDR or FSI in lieu.",
    sourceRef: "MR&TP Act, 1966; UDCPR",
    module: "foundation",
    related: ["road-width", "tdr", "development-plan"],
  },
  {
    slug: "development-plan",
    term: "Development Plan (DP)",
    shortDef: "The statutory land-use plan of a city showing zones, roads and reservations.",
    body: "A DP is prepared by the planning authority under the Maharashtra Regional and Town Planning Act. Reading a plot's zone, reservations and proposed roads on the DP is the first step before any design.",
    sourceRef: "MR&TP Act, 1966",
    module: "foundation",
    related: ["zoning", "reservation", "road-widening", "regional-plan"],
  },
  {
    slug: "regional-plan",
    term: "Regional Plan",
    shortDef: "The land-use plan for a region, governing areas outside municipal Development Plans.",
    body: "Areas not covered by a city's DP are usually governed by the Regional Plan. It defines broad zones such as residential, agricultural and green zones, and determines what development is permissible.",
    sourceRef: "MR&TP Act, 1966",
    module: "foundation",
    related: ["development-plan", "zoning"],
  },
  {
    slug: "zoning",
    term: "Zoning",
    shortDef: "The division of land into zones where specific uses are permitted.",
    body: "Each zone (residential, commercial, industrial, green and so on) permits certain uses as of right and others conditionally. Zoning answers 'what can be built here' before FSI answers 'how much'.",
    sourceRef: "UDCPR, Maharashtra",
    module: "foundation",
    related: ["development-plan", "regional-plan"],
  },
  {
    slug: "reservation",
    term: "Reservation",
    shortDef: "Land earmarked in a Development Plan for a public purpose such as a school or garden.",
    body: "A reserved plot cannot be developed freely. Owners may develop it through provisions such as accommodation reservation or handing it over in exchange for TDR, depending on the regulations.",
    sourceRef: "MR&TP Act, 1966; UDCPR",
    module: "foundation",
    related: ["development-plan", "tdr", "amenity-space"],
  },
  {
    slug: "plot",
    term: "Plot",
    shortDef: "A parcel of land with defined boundaries, held under one ownership title.",
    body: "Every project starts by verifying the plot: area as per title and land records, boundaries on site, access road, zone and reservations. Errors here carry into every calculation after.",
    sourceRef: "UDCPR, Maharashtra",
    module: "foundation",
    related: ["layout", "subdivision", "development-plan"],
    diagram: "plot",
  },
  {
    slug: "layout",
    term: "Layout",
    shortDef: "A planned arrangement of plots, roads and open spaces on a larger land parcel.",
    body: "A layout divides land into plots with internal roads, recreational open space and amenity space as required. Once sanctioned, it governs every plot inside it.",
    sourceRef: "UDCPR, Maharashtra",
    module: "practical-planning",
    related: ["subdivision", "recreational-open-space", "amenity-space"],
  },
  {
    slug: "subdivision",
    term: "Subdivision",
    shortDef: "Dividing one plot into two or more plots with the planning authority's approval.",
    body: "Subdivision requires each resulting plot to meet minimum size, frontage and access norms. Larger subdivisions trigger open-space and amenity requirements like a layout.",
    sourceRef: "UDCPR, Maharashtra",
    module: "practical-planning",
    related: ["layout", "plot"],
  },
  {
    slug: "recreational-open-space",
    term: "Recreational Open Space (ROS)",
    shortDef: "Open land kept for recreation within a layout above a prescribed size.",
    body: "ROS is a percentage of the layout area that must be left open and usable for recreation. Its location, shape and access are as important as its area.",
    sourceRef: "UDCPR, Maharashtra",
    module: "practical-planning",
    related: ["layout", "amenity-space"],
  },
  {
    slug: "amenity-space",
    term: "Amenity Space",
    shortDef: "Land in a large layout set aside for public amenities such as schools or clinics.",
    body: "Beyond a threshold area, layouts must provide amenity space, often handed over to the planning authority. Some regulations allow FSI or TDR in lieu of the handed-over land.",
    sourceRef: "UDCPR, Maharashtra",
    module: "practical-planning",
    related: ["layout", "recreational-open-space", "reservation"],
  },
  {
    slug: "ground-coverage",
    term: "Ground Coverage",
    shortDef: "The portion of the plot area covered by the building at ground level.",
    body: "Ground coverage limits how much of the plot the building footprint may occupy, keeping open space at ground level. It works together with setbacks and FSI.",
    sourceRef: "UDCPR, Maharashtra",
    module: "udcpr",
    related: ["building-envelope", "setback", "fsi"],
  },
  {
    slug: "built-up-area",
    term: "Built-up Area",
    shortDef: "The floor area of a building including walls, counted towards FSI as per the regulations.",
    body: "Not every square metre built counts towards FSI. Regulations list areas that are counted and those exempted, such as certain staircases, lift wells or parking. Knowing the difference is the core of an FSI calculation.",
    sourceRef: "UDCPR, Maharashtra",
    module: "udcpr",
    related: ["fsi", "carpet-area"],
  },
  {
    slug: "carpet-area",
    term: "Carpet Area",
    shortDef: "The net usable floor area of a unit, excluding external walls and common areas.",
    body: "Carpet area is what the buyer actually uses. RERA requires sale by carpet area, while FSI calculations use built-up area, so both must be tracked on a project.",
    sourceRef: "RERA Act, 2016",
    module: "professional-practice",
    related: ["built-up-area"],
  },
  {
    slug: "commencement-certificate",
    term: "Commencement Certificate (CC)",
    shortDef: "The permission from the planning authority to start construction.",
    body: "The CC is issued once building plans are sanctioned and conditions met. Work started without a CC is unauthorised. CCs are often issued in stages, such as up to plinth and then further.",
    sourceRef: "MR&TP Act, 1966; UDCPR",
    module: "professional-practice",
    related: ["occupancy-certificate", "noc", "plinth"],
  },
  {
    slug: "occupancy-certificate",
    term: "Occupancy Certificate (OC)",
    shortDef: "The certificate confirming a building is complete as sanctioned and fit to occupy.",
    body: "The OC is granted after a completion inspection. Without it, the building cannot be lawfully occupied, and buyers may face issues with utilities and registration.",
    sourceRef: "UDCPR, Maharashtra",
    module: "professional-practice",
    related: ["commencement-certificate"],
  },
  {
    slug: "noc",
    term: "NOC (No Objection Certificate)",
    shortDef: "A clearance from a specific department, required before or during approval.",
    body: "Depending on the project, NOCs may be needed from departments such as fire, tree authority, environment or airport authority. Mapping required NOCs early avoids last-minute delays in sanction.",
    module: "professional-practice",
    related: ["commencement-certificate"],
  },
  {
    slug: "plinth",
    term: "Plinth",
    shortDef: "The portion of a building between the surrounding ground and the ground-floor level.",
    body: "Plinth checking is a common stage in approvals: the authority verifies that the building has been set out as per sanctioned plans before further CC is granted.",
    sourceRef: "UDCPR, Maharashtra",
    module: "professional-practice",
    related: ["commencement-certificate", "building-line"],
  },
];

/** Deterministic "term of the day": same term for everyone on a given IST date. */
export function termOfTheDayIndex(date: Date, count: number): number {
  const ist = new Date(date.getTime() + 330 * 60_000);
  const dayNumber = Math.floor(ist.getTime() / 86_400_000);
  return ((dayNumber % count) + count) % count;
}
