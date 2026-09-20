import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { buildDestinationUrl } from "@/lib/codes";
import { CardData, DestType } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const card = await redis.get<CardData>(`card:${params.code}`);
  if (!card) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ card });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const existing = await redis.get<CardData>(`card:${params.code}`);
  if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const localName: string = body.localName ?? existing.localName;
  const destType: DestType = body.destType ?? existing.destType;
  const destValue: string = body.destValue ?? existing.destValue;
  const destUrl = destValue ? buildDestinationUrl(destType, destValue) : "";

  const updated: CardData = {
    ...existing,
    localName,
    destType,
    destValue,
    destUrl,
    status: destUrl ? "asignada" : "libre",
    updatedAt: Date.now(),
  };

  await redis.set(`card:${params.code}`, updated);
  return NextResponse.json({ card: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  await redis.del(`card:${params.code}`);
  await redis.srem("cards:index", params.code);
  return NextResponse.json({ ok: true });
}
