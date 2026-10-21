import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { SiteFooter } from "@/components/shell/footer";
import { MarketingHeader } from "@/components/shell/marketing-header";
import { getViewer } from "@/lib/auth/viewer";

// Per-user pages: never prerender, even in demo mode where no cookie is read.
export const dynamic = "force-dynamic";

/**
 * App routes. Signed-out visitors (e.g. /notes public subset) get the marketing
 * chrome; protected pages call requireViewer() and the proxy redirects early.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <>
        <MarketingHeader />
        <main className="mx-auto w-full max-w-[var(--container-content)] px-4 py-8 sm:px-6">{children}</main>
        <SiteFooter />
      </>
    );
  }
  return <AppShell viewer={viewer}>{children}</AppShell>;
}
