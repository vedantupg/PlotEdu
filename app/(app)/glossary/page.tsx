import type { Metadata } from "next";
import { GlossaryBrowser } from "@/components/features/glossary-browser";
import { PageHeader } from "@/components/ui/page-header";
import { COURSE_ONE } from "@/lib/content/course";
import { getGlossary } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Glossary of planning terms",
  description:
    "Plain-language definitions of UDCPR and development-control terms used in Maharashtra: FSI, TDR, setbacks, building envelope, Development Plan and more.",
};

export default async function GlossaryPage() {
  const terms = await getGlossary();
  return (
    <>
      <PageHeader
        eyebrow={`Glossary · ${terms.length} terms`}
        title="The language of the plot"
        lead="Every term you’ll meet in UDCPR and development permission, in plain words, with where it comes from."
      />
      <GlossaryBrowser
        terms={terms.map((t) => ({ slug: t.slug, term: t.term, shortDef: t.shortDef, moduleSlug: t.moduleSlug }))}
        modules={COURSE_ONE.modules.map((m) => ({ slug: m.slug, title: m.title }))}
      />
    </>
  );
}
