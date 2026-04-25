// ─────────────────────────────────────────
// SECTION: Admin Route Protection Middleware
// WHAT: Guards all /admin/* routes — redirects to /admin login if no session.
// WHY: Prevents unauthenticated access to admin dashboard and sub-pages.
// PHASE 4: No changes needed.
// ─────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Always allow the callback route through — it sets the session
  if (pathname === "/admin/callback") {
    return response;
  }

  // Allow the login page itself through unauthenticated
  if (pathname === "/admin") {
    return response;
  }

  // For all other /admin/* routes, check session
  const supabase = createMiddlewareSupabaseClient(request, response);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL("/admin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
