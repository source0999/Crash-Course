"use client";

// ─────────────────────────────────────────
// SECTION: Admin Login Page
// WHAT: Magic link email form — sends OTP via Supabase Auth.
// WHY: Password-free auth. Barber enters email, clicks link, session is created.
// PHASE 4: No changes needed — already wired to Supabase Auth.
// ─────────────────────────────────────────
import { Suspense, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
// Shared URL resolver (prod domain -> preview URL -> localhost fallback).
import { getURL } from "@/lib/url";

function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Simple resend cooldown timer (1s tick) to prevent rapid OTP requests.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit() {
    // Guard empty input and disabled resend window.
    if (!email.trim() || cooldown > 0) return;
    setLoading(true);
    setError(null);
    setSent(false);

    // Supabase magic-link login; callback URL must match allowed redirect URLs.
// Inside your handleLogin function in app/admin/page.tsx
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    // This dynamically picks up the current URL (localhost, preview, or production)
    emailRedirectTo: `${window.location.origin}/admin/callback`,
  },
})
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Success state + throttle resends for better UX and fewer rate-limit issues.
    setSent(true);
    setCooldown(60);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-transparent">
      <div className="w-full max-w-sm rounded-2xl border border-theme-3 bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="mb-10 text-center">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-2"
            style={{ color: "var(--theme-accent)", fontFamily: "var(--font-sans)" }}
          >
            Fades &amp; Facials
          </p>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--theme-text)", fontFamily: "var(--font-display)" }}
          >
            Admin Access
          </h1>
        </div>

        {sent && (
          <div
            className="mb-4 rounded-lg px-4 py-3 text-sm text-center"
            style={{
              background: "color-mix(in srgb, var(--theme-accent) 18%, transparent)",
              border: "1px solid color-mix(in srgb, var(--theme-accent) 40%, transparent)",
              color: "var(--theme-text)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Magic link sent! Check your email and click the link.
            {cooldown > 0 && (
              <p
                className="mt-1 text-xs"
                style={{ color: "color-mix(in srgb, var(--theme-text) 55%, transparent)" }}
              >
                Need another? Wait {cooldown}s before resending.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg px-4 py-3 focus:outline-none transition min-h-[44px]"
            style={{
              background: "var(--theme-surface)",
              border: "1px solid color-mix(in srgb, var(--theme-text) 15%, transparent)",
              color: "var(--theme-text)",
              fontFamily: "var(--font-sans)",
            }}
          />

          {error && (
            <p
              className="text-sm text-center"
              style={{ color: "color-mix(in srgb, #e05c5c 80%, var(--theme-text))", fontFamily: "var(--font-sans)" }}
            >
              {error}
            </p>
          )}

          {urlError && !error && (
            <p
              className="text-sm text-center"
              style={{ color: "color-mix(in srgb, #e05c5c 80%, var(--theme-text))", fontFamily: "var(--font-sans)" }}
            >
              {urlError === "otp_expired"
                ? "Link expired — request a new one below."
                : "Auth failed — try again."}
            </p>
          )}

          <button
            onClick={handleSubmit}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabled={loading || cooldown > 0}
            className="w-full rounded-lg px-6 py-3 font-semibold shadow-md transition-colors duration-200 bg-theme-4 text-white hover:bg-theme-5 hover:text-theme-4 disabled:opacity-50 min-h-[44px] touch-manipulation"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {loading
              ? "Sending..."
              : cooldown > 0
                ? `Wait ${cooldown}s to resend`
                : sent
                  ? "Resend Magic Link"
                  : "Send Magic Link"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}