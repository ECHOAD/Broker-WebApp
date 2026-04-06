import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { Database } from "@/lib/supabase/database.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

type PropertyLeadTarget = Pick<
  Database["public"]["Tables"]["properties"]["Row"],
  "id" | "slug" | "title" | "whatsapp_phone" | "project_id"
>;

type ProjectContactTarget = Pick<Database["public"]["Tables"]["projects"]["Row"], "whatsapp_phone">;

function cleanPhone(value: string) {
  return value.replace(/[^\d+\s()-]/g, "").trim();
}

function normalizeWhatsAppPhone(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const propertySlug = String(formData.get("propertySlug") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = cleanPhone(String(formData.get("phone") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();
  const meetingInterest = formData.get("meetingInterest") === "on";
  const consentContact = formData.get("consentContact") === "on";

  const fieldErrors: Record<string, string> = {};

  if (fullName.length < 2) {
    fieldErrors.fullName = "Necesitamos al menos nombre y apellido.";
  }

  if (phone.length < 7) {
    fieldErrors.phone = "Ingresa un número válido para continuar.";
  }

  if (email && !EMAIL_REGEX.test(email)) {
    fieldErrors.email = "El correo no tiene un formato válido.";
  }

  if (!consentContact) {
    fieldErrors.consentContact =
      "Debes autorizar el contacto para registrar la consulta.";
  }

  if (!propertyId || !propertySlug) {
    return NextResponse.json(
      {
        ok: false,
        message: "No pudimos identificar la propiedad seleccionada.",
        fieldErrors,
      },
      { status: 400 },
    );
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "Revisa los campos marcados e inténtalo otra vez.",
        fieldErrors,
      },
      { status: 400 },
    );
  }

  const supabase = createPublicClient();
  const { data: propertyData, error: propertyError } = await supabase
    .from("properties")
    .select("id, slug, title, whatsapp_phone, project_id")
    .eq("id", propertyId)
    .eq("slug", propertySlug)
    .maybeSingle();

  const property = propertyData as PropertyLeadTarget | null;

  if (propertyError || !property) {
    return NextResponse.json(
      {
        ok: false,
        message: "La propiedad ya no está disponible para recibir consultas.",
      },
      { status: 404 },
    );
  }

  let whatsappPhone = property.whatsapp_phone;

  if (!whatsappPhone && property.project_id) {
    const { data: projectData } = await supabase
      .from("projects")
      .select("whatsapp_phone")
      .eq("id", property.project_id)
      .maybeSingle();

    const project = projectData as ProjectContactTarget | null;
    whatsappPhone = project?.whatsapp_phone ?? null;
  }

  const sourcePath = `/propiedades/${property.slug}`;
  const consentCapturedAt = new Date().toISOString();
  const leadId = crypto.randomUUID();

  const { error: leadError } = await supabase
    .from("leads")
    .insert({
      id: leadId,
      source: "public_form",
      current_status: "new",
      full_name: fullName,
      email: email || null,
      phone,
      preferred_language: "es",
      message: message || null,
      meeting_interest: meetingInterest,
      consent_contact: true,
      consent_privacy_version: "2026-04-05",
      consent_source: "property_detail_form",
      consent_captured_at: consentCapturedAt,
      source_path: sourcePath,
    });

  if (leadError) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "No pudimos registrar tu consulta ahora mismo. Intenta otra vez en unos minutos.",
      },
      { status: 500 },
    );
  }

  const { error: interestError } = await supabase.from("lead_property_interests").insert({
    lead_id: leadId,
    property_id: property.id,
    source_context: "property_detail",
  });

  if (interestError) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "La consulta se guardó parcialmente pero no pudimos enlazarla a la propiedad. Reintenta.",
      },
      { status: 500 },
    );
  }

  const whatsappText = [
    `Hola, soy ${fullName}.`,
    `Me interesa ${property.title}.`,
    message ? `Comentario: ${message}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const redirectUrl = whatsappPhone
    ? `https://wa.me/${normalizeWhatsAppPhone(whatsappPhone)}?text=${encodeURIComponent(whatsappText)}`
    : `/catalogo?lead=${leadId}`;

  return NextResponse.json({
    ok: true,
    redirectUrl,
  });
}
