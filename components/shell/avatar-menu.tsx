import Image from "next/image";
import Link from "next/link";
import type { Profile } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "P";
}

export function Avatar({ profile, size = 32 }: { profile: Profile; size?: number }) {
  if (profile.avatarUrl) {
    return (
      <Image src={profile.avatarUrl} alt="" width={size} height={size} className="rounded-full border border-line" />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="grid place-items-center rounded-full border border-line-strong bg-surface-3 text-xs font-semibold text-fg"
    >
      {initials(profile.fullName, profile.email)}
    </span>
  );
}

/**
 * Profile + theme + Admin + sign out behind the avatar. Uses <details> so it
 * works without client JS; placement differs for rail (opens right) and top bar.
 */
export function AvatarMenu({
  profile,
  placement,
  demo,
}: {
  profile: Profile;
  placement: "rail" | "topbar";
  demo: boolean;
}) {
  return (
    <details className="group relative">
      <summary
        className="grid size-11 cursor-pointer list-none place-items-center rounded-full [&::-webkit-details-marker]:hidden"
        aria-label="Account menu"
      >
        <Avatar profile={profile} />
      </summary>
      <div
        className={cn(
          "card-raised absolute z-50 w-64 p-2 animate-fade-up",
          placement === "rail" ? "bottom-0 left-full ml-3" : "right-0 top-full mt-2",
        )}
      >
        <div className="px-2 pt-1">
          <p className="truncate font-semibold">{profile.fullName ?? "Your profile"}</p>
          <p className="truncate text-sm text-muted">{profile.email}</p>
        </div>
        <div className="my-3 h-px bg-line" />
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-muted">Theme</span>
          <ThemeToggle />
        </div>
        <div className="my-3 h-px bg-line" />
        <ul className="space-y-0.5 text-sm">
          <li>
            <Link href="/onboarding" className="block rounded-lg px-2 py-2 hover:bg-surface-2">
              Edit profile
            </Link>
          </li>
          {profile.role === "admin" ? (
            <li>
              <Link href="/admin" className="block rounded-lg px-2 py-2 hover:bg-surface-2">
                Admin console
              </Link>
            </li>
          ) : null}
          <li>
            {demo ? (
              <span className="block px-2 py-2 text-sm text-muted">Demo mode — no sign out</span>
            ) : (
              <form action="/auth/sign-out" method="post">
                <button type="submit" className="w-full rounded-lg px-2 py-2 text-left hover:bg-surface-2">
                  Sign out
                </button>
              </form>
            )}
          </li>
        </ul>
      </div>
    </details>
  );
}
