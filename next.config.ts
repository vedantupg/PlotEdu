import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseWs = supabaseUrl.replace(/^https:/, "wss:");

/** Join non-empty sources so a missing env never leaves stray spaces. */
const src = (...parts: string[]): string => parts.filter(Boolean).join(" ");

/**
 * CSP without nonces (Next docs, "Without Nonces"): keeps landing, course and
 * glossary statically cached. Inline scripts are limited to the theme boot
 * script and JSON-LD. Revisit with SRI/nonces if requirements tighten.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  src("img-src 'self' blob: data: https://lh3.googleusercontent.com", supabaseUrl),
  "font-src 'self'",
  src("connect-src 'self'", supabaseUrl, supabaseWs),
  "object-src 'none'",
  "base-uri 'self'",
  // OAuth: the sign-in server action redirects to Supabase, which redirects to Google.
  src("form-action 'self'", supabaseUrl, "https://accounts.google.com"),
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

/**
 * Cache Components is intentionally off for v1: almost every app route reads the
 * auth cookie, so explicit dynamic rendering keeps the mental model simple.
 * Public SEO pages (landing, course) opt into ISR via `revalidate`.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
