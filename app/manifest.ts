import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GV-R Tap",
    short_name: "GV-R Tap",
    description: "Panel privado para activar y administrar tarjetas QR y NFC.",
    start_url: "/admin",
    display: "standalone",
    
   background_color: "#f5f7fb",
theme_color: "#2563eb",
      {
        src: "/icon-192-v2.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512-v2.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
