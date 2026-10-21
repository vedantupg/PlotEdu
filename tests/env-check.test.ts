import { describe, expect, it } from "vitest";
import { checkEnv } from "@/lib/env-check";

const live = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abcd.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "a".repeat(40),
  SUPABASE_SERVICE_ROLE_KEY: "s".repeat(40),
  NEXT_PUBLIC_SITE_URL: "https://plotedu.in",
};

describe("checkEnv", () => {
  it("demo mode is fine locally and on previews", () => {
    expect(checkEnv({ VERCEL_ENV: "preview" })).toEqual({ mode: "demo", problems: [] });
  });
  it("demo mode is a problem on production", () => {
    expect(checkEnv({ VERCEL_ENV: "production" }).problems).toHaveLength(1);
  });
  it("live mode with full config passes", () => {
    expect(checkEnv(live)).toEqual({ mode: "live", problems: [] });
  });
  it("live mode without the service key is flagged", () => {
    const { SUPABASE_SERVICE_ROLE_KEY: _omit, ...rest } = live;
    void _omit;
    expect(checkEnv(rest).problems[0]).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
  });
});
