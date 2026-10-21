import { IconDoubt, IconGlossary, IconHome, IconNote, IconSession } from "@/components/brand/icons";

/** Five primary destinations, identical on every device (PRD §5). */
export const NAV_ITEMS = [
  { href: "/home", label: "Home", Icon: IconHome },
  { href: "/sessions", label: "Sessions", Icon: IconSession },
  { href: "/notes", label: "Notes", Icon: IconNote },
  { href: "/forum", label: "Forum", Icon: IconDoubt },
  { href: "/glossary", label: "Glossary", Icon: IconGlossary },
] as const;

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
