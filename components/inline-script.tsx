/**
 * Runs during HTML parsing (before first paint) on hard loads. On the client the
 * type flips to text/plain so React does not warn about rendering <script>.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
