"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircleMore } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/contact";

export function FloatingWhatsAppButton() {
  const pathname = usePathname();
  const whatsappUrl = buildWhatsAppUrl();

  if (
    !whatsappUrl ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/auth")
  ) {
    return null;
  }

  return (
    <Link
      aria-label="Abrir WhatsApp con mensaje prellenado"
      className="site-whatsapp-fab"
      href={whatsappUrl}
      rel="noopener noreferrer"
      target="_blank"
      title="Hablar por WhatsApp"
    >
      <span className="site-whatsapp-fab__halo" aria-hidden="true" />
      <MessageCircleMore aria-hidden="true" size={22} strokeWidth={2} />
      <span className="site-whatsapp-fab__label">WhatsApp</span>
    </Link>
  );
}
