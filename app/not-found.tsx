import { TermOfTheDay } from "@/components/features/term-card";
import { ButtonLink } from "@/components/ui/button";

/** Every second teaches — even a 404. */
export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-lg">
        <p className="survey text-accent-ink">Plot not found · 404</p>
        <h1 className="display-2 mt-4">This plot isn&apos;t on the map.</h1>
        <p className="lead mt-4">The page may have moved. While you&apos;re here, learn one thing:</p>
        <TermOfTheDay className="mt-6" />
        <ButtonLink href="/" variant="secondary" className="mt-6">
          ← Back to PlotEdu
        </ButtonLink>
      </div>
    </main>
  );
}
