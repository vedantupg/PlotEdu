import { checkEnv } from "@/lib/env-check";

/** Runs once per server instance: fail fast on a broken production config. */
export function register(): void {
  const { mode, problems } = checkEnv(process.env);
  if (problems.length === 0) {
    console.info(`[plotedu] starting in ${mode} mode`);
    return;
  }
  const message = `[plotedu] environment problems:\n - ${problems.join("\n - ")}`;
  if (process.env.VERCEL_ENV === "production") throw new Error(message);
  console.warn(message);
}
