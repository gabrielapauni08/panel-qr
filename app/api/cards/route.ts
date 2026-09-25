import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { normalizeCode } from "@/lib/codes";
import { CardData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const codes = (await redis.smembers("cards:index")) as string[];

  if (!codes.length) {
    return NextResponse.json(
      { cards: [] },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  const cards = await Promise.all(
    codes.map((code) => redis.get<CardData>(`card:${code}`))
  );

  const list = cards.filter(Boolean) as CardData[];

  list.sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json(
    { cards: list },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
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
    return NextResponse.json(
      { error: "Ese código ya existe" },
      { status: 409 }
    );
  }

  const now = Date.now();

  const card: CardData = {
    code,
    localName: "",
    destType: "url",
    destValue: "",
    destUrl: "",
    status: "libre",
    prepStatus: "qr_listo",
    scans: 0,
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(`card:${code}`, card);
  await redis.sadd("cards:index", code);

  return NextResponse.json({ card });
}
export async function DELETE() {
  const codes = (await redis.smembers("cards:index")) as string[];

  for (const code of codes) {
    await redis.del(`card:${code}`);
  }

  for (let i = 1; i <= 100; i++) {
    const code = `re-${String(i).padStart(3, "0")}`;
    await redis.del(`card:${code}`);
  }

  await redis.del("cards:index");
  await redis.del("cards:counter");

  return NextResponse.json({
    ok: true,
    message: "Tarjetas de prueba eliminadas y contador reiniciado",
  });
}
