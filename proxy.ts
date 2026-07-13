import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("portal_session")?.value);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/portal") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/portal/prescription", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/portal/:path*"],
};
