"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconShield } from "@/components/brand/icons";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";

/** Desktop: slim left rail. Labels sit under icons to keep the rail narrow. */
export function RailNav({ showAdmin }: { showAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col items-stretch gap-1">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative mx-2 flex flex-col items-center gap-1 rounded-[var(--radius-control)] py-2.5 text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg",
              active && "bg-surface-2 text-fg",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute -left-2 top-3 bottom-3 w-0.5 rounded-full bg-accent transition-opacity duration-150",
                active ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon width={22} height={22} />
            <span className="text-[0.6875rem] font-medium tracking-[0.01em]">{label}</span>
          </Link>
        );
      })}
      {showAdmin ? (
        <Link
          href="/admin"
          aria-current={isActive(pathname, "/admin") ? "page" : undefined}
          className={cn(
            "mx-2 mt-auto flex flex-col items-center gap-1 rounded-[var(--radius-control)] py-2.5 text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg",
            isActive(pathname, "/admin") && "text-accent-ink",
          )}
        >
          <IconShield width={22} height={22} />
          <span className="text-[0.6875rem] font-medium tracking-[0.01em]">Admin</span>
        </Link>
      ) : null}
    </nav>
  );
}

/** Mobile: bottom tab bar, 5 icons + labels, 56px tall, safe-area aware. */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-muted",
                  active && "text-fg",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <Icon width={22} height={22} />
                <span className="text-[0.6875rem] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
