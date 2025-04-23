import { createServerClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(
      new URL("/error?message=Internal server error", request.url)
    );
  }
}
