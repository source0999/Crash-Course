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

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit() {
    if (!email.trim() || cooldown > 0) return;
    setLoading(true);
    setError(null);
    setSent(false);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin/callback`
          : `${window.location.origin}/admin/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setCooldown(60);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0f1e2e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-brand-accent mb-2">
            Fades & Facials
          </p>
          <h1 className="text-3xl font-bold text-white">Admin Access</h1>
        </div>

        {sent && (
          <div className="mb-4 rounded-lg bg-green-500/20 border border-green-500/30 px-4 py-3 text-green-300 text-sm text-center">
            ✅ Magic link sent! Check your email and click the link.
            {cooldown > 0 && (
              <p className="mt-1 text-green-300/60 text-xs">
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
            className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent transition min-h-[44px]"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {urlError && !error && (
            <p className="text-red-400 text-sm text-center">
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
            className="w-full rounded-lg bg-brand-accent px-6 py-3 text-black font-semibold transition hover:opacity-90 disabled:opacity-50 min-h-[44px] touch-manipulation"
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