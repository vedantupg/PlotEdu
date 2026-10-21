import Link from "next/link";
import type { ReactNode } from "react";
import { IconSearch } from "@/components/brand/icons";
import { Wordmark } from "@/components/brand/wordmark";
import type { Viewer } from "@/lib/auth/viewer";
import { RailNav, TabBar } from "./app-nav";
import { AvatarMenu } from "./avatar-menu";

/**
 * Signed-in chrome. Desktop: 80px left rail with avatar at the bottom and Admin
 * above it. Mobile: top bar (wordmark, search, avatar) + bottom tab bar.
 */
export function AppShell({ viewer, children }: { viewer: Viewer; children: ReactNode }) {
  const isAdmin = viewer.profile.role === "admin";
  return (
    <div className="min-h-dvh md:pl-20">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center border-r border-line bg-ink py-4 md:flex">
        <Link href="/home" aria-label="PlotEdu home" className="mb-6 grid size-11 place-items-center">
          <span className="display-4 !text-xl">
            <span className="text-fg">P</span>
            <span className="text-accent">E</span>
          </span>
        </Link>
        <RailNav showAdmin={isAdmin} />
        <div className="mt-4">
          <AvatarMenu profile={viewer.profile} placement="rail" demo={viewer.demo} />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-ink/95 px-4 backdrop-blur md:hidden">
        <Link href="/home" aria-label="PlotEdu home" className="text-xl">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/glossary" aria-label="Search" className="grid size-11 place-items-center text-muted">
            <IconSearch />
          </Link>
          <AvatarMenu profile={viewer.profile} placement="topbar" demo={viewer.demo} />
        </div>
      </header>

      {viewer.demo ? (
        <div role="status" className="border-b border-line px-4 py-2 text-center text-[0.8125rem] text-muted">
          <span className="font-semibold text-accent-ink">Demo mode</span> — sample data, viewing as an approved
          student. Connect Supabase to go live.
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[var(--container-content)] px-4 pb-28 pt-6 sm:px-6 md:pb-16 md:pt-10">
        {children}
      </main>
      <TabBar />
    </div>
  );
}
