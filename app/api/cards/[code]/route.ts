import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { buildDestinationUrl } from "@/lib/codes";
import { CardData, DestType, PrepStatus } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const card = await redis.get<CardData>(`card:${params.code}`);

  if (!card) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ card });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const existing = await redis.get<CardData>(`card:${params.code}`);

  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));

  const localName: string = body.localName ?? existing.localName;
  const destType: DestType = body.destType ?? existing.destType;
  const destValue: string = body.destValue ?? existing.destValue;

  const allowedPrepStatuses: PrepStatus[] = [
    "qr_listo",
    "nfc_pendiente",
    "nfc_listo",
    "lista_venta",
  ];

  const prepStatus: PrepStatus =
    allowedPrepStatuses.includes(body.prepStatus)
      ? body.prepStatus
      : existing.prepStatus ?? "qr_listo";

  const destUrl =
    destValue.trim() !== ""
      ? buildDestinationUrl(destType, destValue)
      : "";

  const updated: CardData = {
    ...existing,
    localName,
    destType,
    destValue,
    destUrl,
    status: destUrl ? "asignada" : "libre",
    prepStatus,
    updatedAt: Date.now(),
  };

  await redis.set(`card:${params.code}`, updated);

  return NextResponse.json({ card: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  await redis.del(`card:${params.code}`);
  await redis.srem("cards:index", params.code);

  return NextResponse.json({ ok: true });
}
