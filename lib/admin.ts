import { Database } from "@/lib/supabase/database.types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type LeadStatus = LeadRow["current_status"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectStatus = ProjectRow["status"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyStatus = PropertyRow["commercial_status"];
type ListingMode = PropertyRow["listing_mode"];
type PriceMode = PropertyRow["price_mode"];

// ============================================================================
// Lead Status
// ============================================================================

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Recibido",
  contacted: "En contacto",
  qualified: "Interesado",
  meeting_requested: "Cita pedida",
  meeting_scheduled: "Cita fijada",
  negotiation: "Negociación",
  closed_won: "Vendido / Ganado",
  closed_lost: "No interesado",
  archived: "Archivado",
};

export const PIPELINE_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "meeting_requested",
  "meeting_scheduled",
  "negotiation",
  "closed_won",
  "closed_lost",
  "archived",
];

export const LEAD_STATUS_OPTIONS = PIPELINE_ORDER.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}));

// ============================================================================
// Project Status
// ============================================================================

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export const PROJECT_STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// ============================================================================
// Property Status
// ============================================================================

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "Disponible",
  reserved: "Reservado",
  sold: "Vendido",
  rented: "Rentado",
  hidden: "Oculto",
};

export const PROPERTY_STATUS_OPTIONS = Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// ============================================================================
// Listing Mode
// ============================================================================

export const LISTING_MODE_LABELS: Record<ListingMode, string> = {
  sale: "Venta",
  rent: "Renta",
  sale_rent: "Venta / Renta",
};

export const LISTING_MODE_OPTIONS = Object.entries(LISTING_MODE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// ============================================================================
// Price Mode
// ============================================================================

export const PRICE_MODE_LABELS: Record<PriceMode, string> = {
  fixed: "Precio fijo",
  on_request: "A consultar",
};

export const PRICE_MODE_OPTIONS = Object.entries(PRICE_MODE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// ============================================================================
// Helpers
// ============================================================================

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toNullableText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

export function toNullableInteger(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function toNullableNumeric(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCurrency(amount: number | null, currency: string, priceMode: PriceMode) {
  if (priceMode === "on_request" || amount === null) {
    return "Precio a solicitud";
  }

  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
    maximumFractionDigits: amount >= 1000000 ? 2 : 0,
  }).format(amount);
}

export function computePipelineCounts(leads: Array<{ current_status: LeadStatus }>) {
  return PIPELINE_ORDER.map((status) => ({
    stage: STATUS_LABELS[status],
    count: leads.filter((lead) => lead.current_status === status).length,
  }));
}

export function computeGroupedLeads(leads: Array<{ current_status: LeadStatus }>) {
  const groups = {
    nuevos: ["new"],
    seguimiento: ["contacted", "qualified", "meeting_requested", "meeting_scheduled", "negotiation"],
    finalizados: ["closed_won", "closed_lost"],
  };

  return {
    nuevos: leads.filter((l) => groups.nuevos.includes(l.current_status)).length,
    seguimiento: leads.filter((l) => groups.seguimiento.includes(l.current_status)).length,
    finalizados: leads.filter((l) => groups.finalizados.includes(l.current_status)).length,
  };
}

export async function listLocations() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export function computeSnapshot(
  leads: Array<{ current_status: LeadStatus }>,
  properties: Array<{ commercial_status: PropertyStatus }>,
  projects: Array<{ status: ProjectStatus }>,
) {
  return [
    { label: "Contactos totales", value: String(leads.length) },
    { label: "Por responder", value: String(leads.filter((lead) => lead.current_status === "new").length) },
    {
      label: "Propiedades activas",
      value: String(properties.filter((property) => ["available", "reserved"].includes(property.commercial_status)).length),
    },
    { label: "Proyectos publicados", value: String(projects.filter((project) => project.status === "published").length) },
  ];
}
