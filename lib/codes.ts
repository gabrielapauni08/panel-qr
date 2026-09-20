import { DestType } from "./types";

/** Convierte cualquier texto en un código seguro para usar en una URL. */
export function normalizeCode(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Arma la URL final a la que se redirige según el tipo de destino elegido. */
export function buildDestinationUrl(destType: DestType, destValue: string): string {
  const value = destValue.trim();
  if (!value) return "";

  if (destType === "google") {
    // Si ya es un link completo (g.page/r/..., o cualquier http), lo dejamos tal cual.
    if (/^https?:\/\//i.test(value)) return value;
    // Si parece un Place ID de Google, armamos el link de reseña directa.
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(value)}`;
  }

  if (destType === "instagram") {
    const username = value
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/^@/, "")
      .replace(/\/$/, "");
    return `https://instagram.com/${username}`;
  }

  // url directa
  if (!/^https?:\/\//i.test(value)) return `https://${value}`;
  return value;
}
