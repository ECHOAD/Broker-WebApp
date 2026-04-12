import "@fontsource/noto-serif/400.css";
import "@fontsource/noto-serif/700.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import type { Metadata } from "next";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";
import "./globals.css";

const SITE_TITLE = "Carlos Realto";
const SITE_DESCRIPTION =
  "Broker webapp editorial para explorar propiedades, proyectos y oportunidades inmobiliarias premium.";
const BROKER_OG_IMAGE = "/broker-photo-2.jpg";

const getMetadataBase = () => {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";

  const normalizedSiteUrl = siteUrl.startsWith("http")
    ? siteUrl
    : `https://${siteUrl}`;

  return new URL(normalizedSiteUrl);
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: "/",
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: BROKER_OG_IMAGE,
        width: 553,
        height: 729,
        alt: "Carlos Morla - Broker Inmobiliario Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [BROKER_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-background font-sans text-foreground antialiased relative">
        <div className="grain-overlay" aria-hidden="true" />
        {children}
        <FloatingWhatsAppButton />
      </body>
    </html>
  );
}
