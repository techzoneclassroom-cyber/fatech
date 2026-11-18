import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  // Unconfigured: the gated layout shows setup instructions and no data.
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let signedIn = false;
  try {
    signedIn = Boolean((await supabase.auth.getUser()).data.user);
  } catch {
    // Network failure: treat as signed out rather than letting the request through.
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    if (!signedIn && pathname !== "/admin/login") {
      const to = request.nextUrl.clone();
      to.pathname = "/admin/login";
      to.search = "";
      return NextResponse.redirect(to);
    }
    if (signedIn && pathname === "/admin/login") {
      const to = request.nextUrl.clone();
      to.pathname = "/admin";
      to.search = "";
      return NextResponse.redirect(to);
    }
  }
  // /account/login and /account/signup stay open; only the account page itself is gated.
  if (pathname === "/account" && !signedIn) {
    const to = request.nextUrl.clone();
    to.pathname = "/account/login";
    to.search = "";
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
