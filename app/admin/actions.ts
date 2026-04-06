"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];
type ListingMode = Database["public"]["Enums"]["listing_mode"];
type PriceMode = Database["public"]["Enums"]["price_mode"];
type PropertyStatus = Database["public"]["Enums"]["property_status"];

const ALLOWED_LEAD_STATUSES: LeadStatus[] = [
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

const ALLOWED_PROJECT_STATUSES: ProjectStatus[] = ["draft", "published", "archived"];
const ALLOWED_LISTING_MODES: ListingMode[] = ["sale", "rent", "sale_rent"];
const ALLOWED_PRICE_MODES: PriceMode[] = ["fixed", "on_request"];
const ALLOWED_PROPERTY_STATUSES: PropertyStatus[] = [
  "available",
  "reserved",
  "sold",
  "rented",
  "hidden",
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNullableText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function toNullableInteger(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toNullableNumeric(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildAdminRedirect(formData: FormData, fallback: { leadId?: string; projectId?: string; propertyId?: string } = {}) {
  const leadId =
    String(formData.get("selectedLeadId") ?? "").trim() ||
    fallback.leadId ||
    "";
  const projectId =
    String(formData.get("selectedProjectId") ?? "").trim() ||
    fallback.projectId ||
    "";
  const propertyId =
    String(formData.get("selectedPropertyId") ?? "").trim() ||
    fallback.propertyId ||
    "";
  const params = new URLSearchParams();

  if (leadId) {
    params.set("lead", leadId);
  }

  if (projectId) {
    params.set("project", projectId);
  }

  if (propertyId) {
    params.set("property", propertyId);
  }

  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

async function requireBrokerAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile || profile.role !== "broker_admin") {
    redirect("/admin");
  }

  return { supabase, user };
}

export async function updateLeadStatus(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as LeadStatus;
  const redirectTo = buildAdminRedirect(formData, { leadId });

  if (!leadId || !ALLOWED_LEAD_STATUSES.includes(status)) {
    redirect("/admin");
  }

  const { supabase, user } = await requireBrokerAdmin();

  const { error } = await supabase
    .from("leads")
    .update({
      current_status: status,
      updated_by: user.id,
    })
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirect(redirectTo);
}

export async function upsertProject(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim() as ProjectStatus;
  const isFeatured = formData.get("isFeatured") === "on";
  const headline = toNullableText(formData.get("headline"));
  const summary = toNullableText(formData.get("summary"));
  const description = toNullableText(formData.get("description"));
  const whatsappPhone = toNullableText(formData.get("whatsappPhone"));
  const approximateLocationText = toNullableText(formData.get("approximateLocationText"));
  const sortOrder = toNullableInteger(formData.get("sortOrder")) ?? 0;

  if (!name || !ALLOWED_PROJECT_STATUSES.includes(status)) {
    redirect(buildAdminRedirect(formData, { projectId }));
  }

  const slug = slugify(slugInput || name);
  const { supabase, user } = await requireBrokerAdmin();
  const payload = {
    slug,
    name,
    headline,
    summary,
    description,
    whatsapp_phone: whatsappPhone,
    status,
    sort_order: sortOrder,
    is_featured: isFeatured,
    approximate_location_text: approximateLocationText,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_by: user.id,
    ...(projectId ? {} : { created_by: user.id }),
  };

  const query = projectId
    ? supabase.from("projects").update(payload).eq("id", projectId).select("id").single()
    : supabase.from("projects").insert(payload).select("id").single();
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirect(buildAdminRedirect(formData, { projectId: data.id }));
}

export async function archiveProject(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const redirectTo = buildAdminRedirect(formData, { projectId });

  if (!projectId) {
    redirect(redirectTo);
  }

  const { supabase, user } = await requireBrokerAdmin();
  const { error } = await supabase
    .from("projects")
    .update({
      status: "archived",
      published_at: null,
      updated_by: user.id,
    })
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirect(redirectTo);
}

export async function upsertProperty(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const projectId = toNullableText(formData.get("projectIdRef"));
  const propertyTypeId = String(formData.get("propertyTypeId") ?? "").trim();
  const listingMode = String(formData.get("listingMode") ?? "sale").trim() as ListingMode;
  const commercialStatus = String(formData.get("commercialStatus") ?? "available").trim() as PropertyStatus;
  const priceMode = String(formData.get("priceMode") ?? "fixed").trim() as PriceMode;
  const baseCurrency = String(formData.get("baseCurrency") ?? "USD").trim().toUpperCase();
  const priceAmount = toNullableNumeric(formData.get("priceAmount"));
  const bedrooms = toNullableInteger(formData.get("bedrooms"));
  const bathrooms = toNullableInteger(formData.get("bathrooms"));
  const parkingSpaces = toNullableInteger(formData.get("parkingSpaces"));
  const constructionArea = toNullableNumeric(formData.get("constructionAreaM2"));
  const lotArea = toNullableNumeric(formData.get("lotAreaM2"));
  const isFeatured = formData.get("isFeatured") === "on";
  const summary = toNullableText(formData.get("summary"));
  const description = toNullableText(formData.get("description"));
  const approximateLocationText = toNullableText(formData.get("approximateLocationText"));
  const whatsappPhone = toNullableText(formData.get("whatsappPhone"));

  if (
    !title ||
    !propertyTypeId ||
    !ALLOWED_LISTING_MODES.includes(listingMode) ||
    !ALLOWED_PROPERTY_STATUSES.includes(commercialStatus) ||
    !ALLOWED_PRICE_MODES.includes(priceMode)
  ) {
    redirect(buildAdminRedirect(formData, { propertyId }));
  }

  const slug = slugify(slugInput || title);
  const { supabase, user } = await requireBrokerAdmin();
  const payload = {
    project_id: projectId,
    property_type_id: propertyTypeId,
    slug,
    title,
    summary,
    description,
    listing_mode: listingMode,
    commercial_status: commercialStatus,
    price_mode: priceMode,
    base_currency: baseCurrency || "USD",
    price_amount: priceMode === "fixed" ? priceAmount : null,
    bedrooms,
    bathrooms,
    parking_spaces: parkingSpaces,
    construction_area_m2: constructionArea,
    lot_area_m2: lotArea,
    approximate_location_text: approximateLocationText,
    whatsapp_phone: whatsappPhone,
    is_featured: isFeatured,
    published_at: commercialStatus === "hidden" ? null : new Date().toISOString(),
    updated_by: user.id,
    ...(propertyId ? {} : { created_by: user.id }),
  };

  const query = propertyId
    ? supabase.from("properties").update(payload).eq("id", propertyId).select("id, project_id").single()
    : supabase.from("properties").insert(payload).select("id, project_id").single();
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirect(buildAdminRedirect(formData, { propertyId: data.id, projectId: data.project_id ?? undefined }));
}

export async function hideProperty(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const redirectTo = buildAdminRedirect(formData, { propertyId });

  if (!propertyId) {
    redirect(redirectTo);
  }

  const { supabase, user } = await requireBrokerAdmin();
  const { error } = await supabase
    .from("properties")
    .update({
      commercial_status: "hidden",
      published_at: null,
      updated_by: user.id,
    })
    .eq("id", propertyId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirect(redirectTo);
}
