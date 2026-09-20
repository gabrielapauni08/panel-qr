import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { normalizeCode } from "@/lib/codes";
import { CardData } from "@/lib/types";

export async function GET() {
  const codes = (await redis.smembers("cards:index")) as string[];
  if (!codes.length) return NextResponse.json({ cards: [] });

  const cards = await Promise.all(
    codes.map((c) => redis.get<CardData>(`card:${c}`))
  );
  const list = cards.filter(Boolean) as CardData[];
  list.sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ cards: list });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  let code: string = body.code ? normalizeCode(body.code) : "";

  if (!code) {
    const n = await redis.incr("cards:counter");
    code = `re-${String(n).padStart(3, "0")}`;
  }

  const exists = await redis.get(`card:${code}`);
  if (exists) {
    return NextResponse.json({ error: "Ese código ya existe" }, { status: 409 });
  }

  const now = Date.now();
  const card: CardData = {
    code,
    localName: "",
    destType: "url",
    destValue: "",
    destUrl: "",
    status: "libre",
    scans: 0,
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(`card:${code}`, card);
  await redis.sadd("cards:index", code);

  return NextResponse.json({ card });
}
