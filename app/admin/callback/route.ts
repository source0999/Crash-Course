// ─────────────────────────────────────────
// SECTION: Auth Callback Route Handler
// WHAT: Exchanges the Supabase magic link code for a user session.
// WHY: Supabase OTP links send a ?code= param via PKCE flow — this exchanges it for a session cookie.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // If Supabase returned an error (expired link, etc), send back to login with message
  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${error}`);
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}/admin/dashboard`);
    }
    return NextResponse.redirect(`${origin}/admin?error=exchange_failed`);
  }

  return NextResponse.redirect(`${origin}/admin?error=no_code`);
}
