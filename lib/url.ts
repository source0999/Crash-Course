// ─────────────────────────────────────────
// SECTION: URL Helper
// WHAT: Returns the canonical site URL for auth redirect targets.
// WHY: Hardcoded URLs break across localhost / Vercel preview / production.
// PHASE 4: No changes needed — env vars cover all environments.
// ─────────────────────────────────────────
export function getURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";

  url = url.includes("http") ? url : `https://${url}`;
  url = url.endsWith("/") ? url.slice(0, -1) : url;
  return url;
}
