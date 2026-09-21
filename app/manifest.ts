import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Panel QR",
    short_name: "Panel QR",
    description: "Panel privado para activar y administrar tarjetas QR y NFC.",
    start_url: "/admin",
    display: "standalone",
    background_color: "#0f0f0f",
    theme_color: "#b7ff2a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
