import type { ReactNode } from "react";
import { SiteFooter } from "@/components/shell/footer";
import { MarketingHeader } from "@/components/shell/marketing-header";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MarketingHeader />
      {children}
      <SiteFooter />
    </>
  );
}
