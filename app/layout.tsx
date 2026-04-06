import "@fontsource/noto-serif/400.css";
import "@fontsource/noto-serif/700.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carlos Realto",
  description:
    "Broker webapp editorial para explorar propiedades, proyectos y oportunidades inmobiliarias premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-background font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
