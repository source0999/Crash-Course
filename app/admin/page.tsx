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

function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  async function handleSubmit() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/admin/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
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

        {!submitted ? (
          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-accent transition min-h-[44px]"
            />

            {(error || urlError) && (
              <p className="text-red-400 text-sm text-center">
                {error ??
                  (urlError === "otp_expired"
                    ? "Link expired — request a new one."
                    : "Auth failed — try again.")}
              </p>
            )}

            <button
              onClick={handleSubmit}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              disabled={loading}
              className="w-full rounded-lg bg-brand-accent px-6 py-3 text-black font-semibold transition hover:opacity-90 disabled:opacity-50 min-h-[44px] touch-manipulation"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white text-lg font-light">Check your email.</p>
            <p className="mt-2 text-white/50 text-sm">
              Click the link we sent to{" "}
              <span className="text-brand-accent">{email}</span> to sign in.
            </p>
          </div>
        )}
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