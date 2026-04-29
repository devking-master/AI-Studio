import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_development_only"
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const { pathname } = request.nextUrl;
  const isProtectedRoute = 
    pathname.startsWith("/Dashboard") || 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/chat");

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (token && (pathname === "/login" || pathname === "/register")) {
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.redirect(new URL("/Dashboard", request.url));
    } catch (error) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Dashboard/:path*", "/dashboard/:path*", "/chat/:path*", "/login", "/register"],
};
