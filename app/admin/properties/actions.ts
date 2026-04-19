"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBrokerAdmin } from "@/lib/auth";
import { slugify, toNullableText, toNullableInteger, toNullableNumeric } from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";

type ListingMode = Database["public"]["Enums"]["listing_mode"];
type PriceMode = Database["public"]["Enums"]["price_mode"];
type PropertyStatus = Database["public"]["Enums"]["property_status"];
type Json = Database["public"]["Tables"]["properties"]["Insert"]["custom_features"];

const ALLOWED_LISTING_MODES: ListingMode[] = ["sale", "rent", "sale_rent"];
const ALLOWED_PRICE_MODES: PriceMode[] = ["fixed", "on_request"];
const ALLOWED_PROPERTY_STATUSES: PropertyStatus[] = ["available", "reserved", "sold", "rented", "hidden"];

const adminPropertiesPath = (projectId: string | null) => {
  if (!projectId) {
    return "/admin/projects";
  }

  return `/admin/properties?project=${projectId}`;
};

const adminPropertyFormPath = (projectId: string | null, propertyId?: string) => {
  if (!projectId) {
    return "/admin/projects";
  }

  return propertyId
    ? `/admin/properties/${propertyId}?project=${projectId}`
    : `/admin/properties/new?project=${projectId}`;
};

const getFilesFromFormData = (formData: FormData, key: string) =>
  formData.getAll(key).filter((value): value is File => value instanceof File && value.size > 0);

const normalizeCustomFeatures = (value: FormDataEntryValue | null): Json => {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        group: typeof item?.group === "string" ? item.group.trim() : "",
        label: typeof item?.label === "string" ? item.label.trim() : "",
        value: typeof item?.value === "string" ? item.value.trim() : "",
      }))
      .filter((item) => item.label && item.value)
      .slice(0, 40);
  } catch {
    return [];
  }
};

async function getPropertyMediaCount(supabase: Awaited<ReturnType<typeof requireBrokerAdmin>>["supabase"], propertyId: string) {
  const { count, error } = await supabase
    .from("property_media")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function uploadPropertyMediaFiles({
  supabase,
  propertyId,
  files,
}: {
  supabase: Awaited<ReturnType<typeof requireBrokerAdmin>>["supabase"];
  propertyId: string;
  files: File[];
}) {
  if (files.length === 0) {
    return;
  }

  const existingMediaCount = await getPropertyMediaCount(supabase, propertyId);

  for (const [index, file] of files.entries()) {
    const fileExt = file.name.split(".").pop() || "jpg";
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
      is_cover: existingMediaCount === 0 && index === 0,
      sort_order: existingMediaCount + index,
    });

    if (dbError) {
      await supabase.storage.from("property-media").remove([filePath]);
      throw new Error(dbError.message);
    }
  }
}

async function insertPropertyMediaPaths({
  supabase,
  propertyId,
  storagePaths,
}: {
  supabase: Awaited<ReturnType<typeof requireBrokerAdmin>>["supabase"];
  propertyId: string;
  storagePaths: string[];
}) {
  const validStoragePaths = storagePaths
    .map((path) => path.trim())
    .filter((path) => path.startsWith(`properties/${propertyId}/`));

  if (validStoragePaths.length === 0) {
    return;
  }

  const existingMediaCount = await getPropertyMediaCount(supabase, propertyId);
  const rows = validStoragePaths.map((storagePath, index) => ({
    property_id: propertyId,
    storage_bucket: "property-media",
    storage_path: storagePath,
    is_cover: existingMediaCount === 0 && index === 0,
    sort_order: existingMediaCount + index,
  }));

  const { error } = await supabase.from("property_media").insert(rows);

  if (error) {
    await supabase.storage.from("property-media").remove(validStoragePaths);
    throw new Error(error.message);
  }
}

async function savePropertyRecord(formData: FormData) {
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
  const customFeatures = normalizeCustomFeatures(formData.get("customFeaturesJson"));

  if (
    !title ||
    !projectId ||
    !propertyTypeId ||
    !ALLOWED_LISTING_MODES.includes(listingMode) ||
    !ALLOWED_PROPERTY_STATUSES.includes(commercialStatus) ||
    !ALLOWED_PRICE_MODES.includes(priceMode)
  ) {
    redirect(adminPropertyFormPath(projectId, propertyId || undefined));
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
    custom_features: customFeatures,
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

  return { data, supabase };
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
  const mediaFiles = getFilesFromFormData(formData, "mediaFiles");
  const customFeatures = normalizeCustomFeatures(formData.get("customFeaturesJson"));

  if (
    !title ||
    !projectId ||
    !propertyTypeId ||
    !ALLOWED_LISTING_MODES.includes(listingMode) ||
    !ALLOWED_PROPERTY_STATUSES.includes(commercialStatus) ||
    !ALLOWED_PRICE_MODES.includes(priceMode)
  ) {
    redirect(adminPropertyFormPath(projectId, propertyId || undefined));
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
    custom_features: customFeatures,
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

  await uploadPropertyMediaFiles({
    supabase,
    propertyId: data.id,
    files: mediaFiles,
  });

  revalidatePath("/admin/properties");
  redirect(adminPropertyFormPath(data.project_id, data.id));
}

export async function savePropertyDetails(formData: FormData) {
  const { data } = await savePropertyRecord(formData);

  revalidatePath("/admin/properties");
  return {
    propertyId: data.id,
    projectId: data.project_id,
    editPath: adminPropertyFormPath(data.project_id, data.id),
  };
}

export async function hideProperty(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const projectId = toNullableText(formData.get("projectIdRef"));

  if (!propertyId) {
    redirect(adminPropertiesPath(projectId));
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
  redirect(adminPropertiesPath(projectId));
}

export async function uploadPropertyMedia(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const files = getFilesFromFormData(formData, "file");

  if (!propertyId || files.length === 0) {
    return { error: "Datos de archivo invalidos." };
  }

  const { supabase } = await requireBrokerAdmin();

  await uploadPropertyMediaFiles({
    supabase,
    propertyId,
    files,
  });

  revalidatePath("/admin/properties");
  return { success: true };
}

export async function registerUploadedPropertyMedia(propertyId: string, storagePaths: string[]) {
  if (!propertyId || storagePaths.length === 0) {
    return { error: "Datos de media invalidos." };
  }

  const { supabase } = await requireBrokerAdmin();

  await insertPropertyMediaPaths({
    supabase,
    propertyId,
    storagePaths,
  });

  revalidatePath("/admin/properties");
  return { success: true };
}

export async function removeUploadedPropertyStorage(storagePaths: string[]) {
  const validStoragePaths = storagePaths.filter((path) => path.startsWith("properties/"));

  if (validStoragePaths.length === 0) {
    return { success: true };
  }

  const { supabase } = await requireBrokerAdmin();
  const { error } = await supabase.storage.from("property-media").remove(validStoragePaths);

  if (error) {
    throw new Error(error.message);
  }

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

export async function deletePropertyMediaBulk(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const mediaIds = formData.getAll("mediaId").map((value) => String(value).trim()).filter(Boolean);

  if (!propertyId || mediaIds.length === 0) {
    return { error: "No hay imagenes seleccionadas." };
  }

  const { supabase } = await requireBrokerAdmin();
  const { data: mediaRows, error: mediaError } = await supabase
    .from("property_media")
    .select("id, storage_path")
    .eq("property_id", propertyId)
    .in("id", mediaIds);

  if (mediaError) {
    throw new Error(mediaError.message);
  }

  const storagePaths = (mediaRows ?? []).map((media) => media.storage_path);
  const confirmedMediaIds = (mediaRows ?? []).map((media) => media.id);

  if (storagePaths.length === 0 || confirmedMediaIds.length === 0) {
    return { error: "No encontramos imagenes validas para eliminar." };
  }

  const { error: storageError } = await supabase.storage.from("property-media").remove(storagePaths);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: dbError } = await supabase.from("property_media").delete().in("id", confirmedMediaIds);

  if (dbError) {
    throw new Error(dbError.message);
  }

  revalidatePath("/admin/properties");
  return { success: true };
}

export async function setPropertyCoverMedia(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const mediaId = String(formData.get("mediaId") ?? "").trim();

  if (!propertyId || !mediaId) {
    return { error: "Datos de portada invalidos." };
  }

  const { supabase } = await requireBrokerAdmin();

  const { data: media, error: mediaError } = await supabase
    .from("property_media")
    .select("id, property_id")
    .eq("id", mediaId)
    .eq("property_id", propertyId)
    .single();

  if (mediaError || !media) {
    throw new Error(mediaError?.message ?? "La imagen no pertenece a esta propiedad.");
  }

  const { error: clearError } = await supabase
    .from("property_media")
    .update({ is_cover: false })
    .eq("property_id", propertyId);

  if (clearError) {
    throw new Error(clearError.message);
  }

  const { error: coverError } = await supabase
    .from("property_media")
    .update({ is_cover: true })
    .eq("id", mediaId)
    .eq("property_id", propertyId);

  if (coverError) {
    throw new Error(coverError.message);
  }

  revalidatePath("/admin/properties");
  return { success: true };
}
