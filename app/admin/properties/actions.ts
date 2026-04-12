"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBrokerAdmin } from "@/lib/auth";
import { slugify, toNullableText, toNullableInteger, toNullableNumeric } from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";

type ListingMode = Database["public"]["Enums"]["listing_mode"];
type PriceMode = Database["public"]["Enums"]["price_mode"];
type PropertyStatus = Database["public"]["Enums"]["property_status"];

const ALLOWED_LISTING_MODES: ListingMode[] = ["sale", "rent", "sale_rent"];
const ALLOWED_PRICE_MODES: PriceMode[] = ["fixed", "on_request"];
const ALLOWED_PROPERTY_STATUSES: PropertyStatus[] = ["available", "reserved", "sold", "rented", "hidden"];

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
    redirect(`/admin/properties${propertyId ? `?property=${propertyId}` : ""}`);
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

  revalidatePath("/admin/properties");
  redirect(`/admin/properties?property=${data.id}`);
}

export async function hideProperty(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "").trim();

  if (!propertyId) {
    redirect("/admin/properties");
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

  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}

export async function uploadPropertyMedia(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const file = formData.get("file") as File;

  if (!propertyId || !file || file.size === 0) {
    return { error: "Datos de archivo invalidos." };
  }

  const { supabase } = await requireBrokerAdmin();

  const fileExt = file.name.split(".").pop();
  const fileName = `${propertyId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `properties/${fileName}`;

  const { error: uploadError } = await supabase.storage.from("property-media").upload(filePath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: dbError } = await supabase.from("property_media").insert({
    property_id: propertyId,
    storage_bucket: "property-media",
    storage_path: filePath,
    is_cover: false,
    sort_order: 0,
  });

  if (dbError) {
    await supabase.storage.from("property-media").remove([filePath]);
    throw new Error(dbError.message);
  }

  revalidatePath("/admin/properties");
  return { success: true };
}

export async function deletePropertyMedia(formData: FormData) {
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const storagePath = String(formData.get("storagePath") ?? "").trim();

  if (!mediaId || !storagePath) {
    return { error: "Datos de media invalidos." };
  }

  const { supabase } = await requireBrokerAdmin();

  const { error: storageError } = await supabase.storage.from("property-media").remove([storagePath]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: dbError } = await supabase.from("property_media").delete().eq("id", mediaId);

  if (dbError) {
    throw new Error(dbError.message);
  }

  revalidatePath("/admin/properties");
  return { success: true };
}
