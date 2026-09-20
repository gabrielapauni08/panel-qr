import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, getExpectedToken } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/cards/:path*"],
};

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const expected = await getExpectedToken();

  if (!cookie || cookie !== expected) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
