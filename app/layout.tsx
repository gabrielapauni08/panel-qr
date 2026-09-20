import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Panel de Tarjetas QR",
  description: "Administrá tus tarjetas QR y a dónde apuntan",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
