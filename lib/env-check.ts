import { z } from "zod";

/**
 * Server environment contract. Validated once at server start (instrumentation.ts).
 * Demo mode (no Supabase env) is allowed locally and on previews, never on the
 * production deployment — a misconfigured prod must fail loudly, not show fake data.
 */
const liveSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().startsWith("https://"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.url(),
});

export type EnvReport = { mode: "live" | "demo"; problems: string[] };

export function checkEnv(env: Record<string, string | undefined>): EnvReport {
  const hasSupabase = Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!hasSupabase) {
    return {
      mode: "demo",
      problems: env.VERCEL_ENV === "production" ? ["Supabase env is missing on the production deployment"] : [],
    };
  }
  const parsed = liveSchema.safeParse(env);
  return {
    mode: "live",
    problems: parsed.success ? [] : parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
  };
}
