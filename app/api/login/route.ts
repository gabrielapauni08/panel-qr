import { NextRequest, NextResponse } from "next/server";
import { checkPassword, getExpectedToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ok = await checkPassword(body.password || "");

  if (!ok) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = await getExpectedToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días
  });
  return res;
}
