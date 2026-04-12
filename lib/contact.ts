const BROKER_WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.trim() ?? "";
const DEFAULT_WHATSAPP_MESSAGE =
  "Hola Carlos, vengo desde la web y me gustaria conversar sobre una propiedad.";

function normalizeWhatsAppPhone(value: string) {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppUrl(message = DEFAULT_WHATSAPP_MESSAGE) {
  if (!BROKER_WHATSAPP_PHONE) {
    return null;
  }

  return `https://wa.me/${normalizeWhatsAppPhone(BROKER_WHATSAPP_PHONE)}?text=${encodeURIComponent(message)}`;
}

export { BROKER_WHATSAPP_PHONE, DEFAULT_WHATSAPP_MESSAGE };
