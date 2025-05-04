import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    console.log("Callback requestUrl.origin:", requestUrl.origin);
    console.log("Callback process.env.NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/dashboard";

    if (!code) {
      return NextResponse.redirect(
        new URL("/error?message=Missing code", requestUrl.origin)
      );
    }

    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(
        new URL(
          `/error?message=${encodeURIComponent(error.message)}`,
          requestUrl.origin
        )
      );
    }

    // URL to redirect to after sign in process completes
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.error("NEXT_PUBLIC_SITE_URL environment variable not set for redirect!");
       return NextResponse.redirect(
        new URL("/error?message=Konfigurationsfehler: Website-URL fehlt für Weiterleitung.", requestUrl.origin)
      );
    }
    return NextResponse.redirect(new URL(next, siteUrl));
  } catch (error) {
    console.error("Callback error:", error);
    const errorUrl = new URL(request.url);
    return NextResponse.redirect(
      new URL("/error?message=Internal server error", errorUrl.origin)
    );
  }
}
