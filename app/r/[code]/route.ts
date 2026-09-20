import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { CardData } from "@/lib/types";

// Esta ruta es pública a propósito: es a la que apunta el QR impreso,
// y quien la abre nunca inició sesión en nada.
export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;
  const card = await redis.get<CardData>(`card:${code}`);

  if (!card || !card.destUrl) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="es">
        <head><meta charset="utf-8" /><title>Cartel sin asignar</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:60px 20px;">
          <h1>Este cartel todavía no tiene destino</h1>
          <p>Código: ${code}</p>
        </body>
      </html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Sumamos el escaneo sin bloquear la redirección al usuario.
  redis
    .set(`card:${code}`, { ...card, scans: (card.scans || 0) + 1 })
    .catch(() => {});

  return NextResponse.redirect(card.destUrl, { status: 302 });
}
