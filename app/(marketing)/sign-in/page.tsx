import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IconGoogle } from "@/components/brand/icons";
import { Wordmark } from "@/components/brand/wordmark";
import { TermOfTheDay } from "@/components/features/term-card";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/actions/auth";
import { getViewer } from "@/lib/auth/viewer";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const ERRORS: Record<string, string> = {
  oauth: "Google sign-in could not start. Please try again.",
  exchange: "That sign-in link expired. Please try again.",
  missing_code: "Sign-in was cancelled.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNextPath(rawNext);
  if (isSupabaseConfigured() && (await getViewer())) redirect(next);

  return (
    <main className="min-h-[calc(100dvh-4rem)] border-b border-line">
      <div className="mx-auto grid max-w-[var(--container-content)] gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
        <div className="max-w-md">
          <p className="survey flex items-center gap-3 text-accent-ink after:h-px after:flex-1 after:bg-line">
            Sign in
          </p>
          <h1 className="display-2 mt-5">
            Welcome to <Wordmark />
          </h1>
          <p className="lead mt-4">
            One tap with your Google account. We only read your name, email and photo — nothing else.
          </p>
          {error && ERRORS[error] ? (
            <p role="alert" className="card mt-6 border-l-2 border-l-danger px-4 py-3 text-sm text-danger">
              {ERRORS[error]}
            </p>
          ) : null}
          <form action={signInWithGoogle} className="mt-8">
            <input type="hidden" name="next" value={next} />
            <Button type="submit" variant="inverse">
              <IconGoogle /> Continue with Google
            </Button>
          </form>
          <p className="mt-6 text-xs text-muted">
            By continuing you agree to our terms and privacy policy. Signing in gives you free notes, the glossary and
            the forum; the batch unlocks once your application is approved.
          </p>
        </div>
        <TermOfTheDay label="While you're here" />
      </div>
    </main>
  );
}
