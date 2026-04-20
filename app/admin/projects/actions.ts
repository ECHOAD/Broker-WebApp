"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBrokerAdmin } from "@/lib/auth";
import { slugify, toNullableText, toNullableInteger, toNullableNumeric } from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";

type ProjectStatus = Database["public"]["Enums"]["project_status"];

const ALLOWED_PROJECT_STATUSES: ProjectStatus[] = ["draft", "published", "archived"];

const toNonNegativeNumber = (value: unknown) => {
  const parsed = toNullableNumeric(String(value ?? ""));
  return parsed === null ? null : Math.max(0, parsed);
};

const normalizeRange = (min: number | null, max: number | null) => {
  if (min === null && max === null) {
    return { min: null, max: null };
  }

  const normalizedMin = min ?? max;
  const normalizedMax = max ?? min;

  if (normalizedMin === null || normalizedMax === null) {
    return { min: normalizedMin, max: normalizedMax };
  }

  return {
    min: Math.min(normalizedMin, normalizedMax),
    max: Math.max(normalizedMin, normalizedMax),
  };
};

const normalizeInventorySummaries = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item, index) => {
        const modelName = typeof item?.modelName === "string" ? item.modelName.trim() : "";
        if (!modelName) {
          return null;
        }

        const availableInput = Math.max(0, Number.parseInt(String(item?.availableLots ?? 0), 10) || 0);
        const totalInput = Math.max(0, Number.parseInt(String(item?.totalLots ?? 0), 10) || 0);
        const totalLots = Math.max(totalInput, availableInput);
        const availableLots = Math.min(totalLots, availableInput);
        const lotRange = normalizeRange(
          toNonNegativeNumber(item?.lotSizeMinM2),
          toNonNegativeNumber(item?.lotSizeMaxM2),
        );
        const priceRange = normalizeRange(
          toNonNegativeNumber(item?.priceMin),
          toNonNegativeNumber(item?.priceMax),
        );

        return {
          model_name: modelName,
          lot_size_min_m2: lotRange.min,
          lot_size_max_m2: lotRange.max,
          habitable_area_m2: toNonNegativeNumber(item?.habitableAreaM2),
          construction_area_m2: toNonNegativeNumber(item?.constructionAreaM2),
          price_min: priceRange.min,
          price_max: priceRange.max,
          available_lots: availableLots,
          total_lots: totalLots,
          bedrooms: toNullableInteger(String(item?.bedrooms ?? "")),
          bathrooms: toNullableNumeric(String(item?.bathrooms ?? "")),
          status_note: toNullableText(String(item?.statusNote ?? "")),
          sort_order: toNullableInteger(String(item?.sortOrder ?? "")) ?? index,
          is_active: item?.isActive !== false,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  } catch {
    return [];
  }
};

async function replaceProjectInventorySummaries(
  supabase: Awaited<ReturnType<typeof requireBrokerAdmin>>["supabase"],
  projectId: string,
  inventorySummaries: ReturnType<typeof normalizeInventorySummaries>,
) {
  const { error: deleteError } = await supabase
    .from("project_inventory_summaries")
    .delete()
    .eq("project_id", projectId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (inventorySummaries.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("project_inventory_summaries").insert(
    inventorySummaries.map((summary) => ({
      ...summary,
      project_id: projectId,
    })),
  );

  if (insertError) {
    throw new Error(insertError.message);
  }
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
  const locationId = toNullableText(formData.get("locationId"));
  const sortOrder = toNullableInteger(formData.get("sortOrder")) ?? 0;
  const inventorySummaries = normalizeInventorySummaries(formData.get("inventorySummariesJson"));

  // Files for unified flow
  const mainImageFile = formData.get("mainImageFile") as File | null;
  const logoFile = formData.get("logoFile") as File | null;

  if (!name || !ALLOWED_PROJECT_STATUSES.includes(status)) {
    redirect(`/admin/projects${projectId ? `/${projectId}` : ""}`);
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
    location_id: locationId,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_by: user.id,
    ...(projectId ? {} : { created_by: user.id }),
  };

  const query = projectId
    ? supabase.from("projects").update(payload).eq("id", projectId).select("id").single()
    : supabase.from("projects").insert(payload).select("id").single();
  const { data, error: dbError } = await query;

  if (dbError) {
    throw new Error(dbError.message);
  }

  const finalProjectId = data.id;
  await replaceProjectInventorySummaries(supabase, finalProjectId, inventorySummaries);
  let updatesAfterUpload: any = {};

  // Handle Main Image if provided in unified form
  if (mainImageFile && mainImageFile.size > 0) {
    const fileExt = mainImageFile.name.split(".").pop();
    const filePath = `projects/covers/${finalProjectId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("property-media").upload(filePath, mainImageFile);
    if (!uploadError) updatesAfterUpload.main_image_storage_path = filePath;
  }

  // Handle Logo if provided in unified form
  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split(".").pop();
    const filePath = `projects/logos/${finalProjectId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("property-media").upload(filePath, logoFile);
    if (!uploadError) updatesAfterUpload.logo_storage_path = filePath;
  }

  if (Object.keys(updatesAfterUpload).length > 0) {
    await supabase.from("projects").update(updatesAfterUpload).eq("id", finalProjectId);
  }

  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${finalProjectId}`);
}

export async function archiveProject(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();

  if (!projectId) {
    redirect("/admin/projects");
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

  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function uploadProjectLogo(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const file = formData.get("file") as File;

  if (!projectId || !file || file.size === 0) {
    return { error: "Datos de archivo invalidos." };
  }

  const { supabase, user } = await requireBrokerAdmin();

  const fileExt = file.name.split(".").pop();
  const fileName = `logos/${projectId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `projects/${fileName}`;

  const { error: uploadError } = await supabase.storage.from("property-media").upload(filePath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: dbError } = await supabase
    .from("projects")
    .update({
      logo_storage_path: filePath,
      updated_by: user.id,
    })
    .eq("id", projectId);

  if (dbError) {
    await supabase.storage.from("property-media").remove([filePath]);
    throw new Error(dbError.message);
  }

  revalidatePath("/admin/projects");
  return { success: true };
}

export async function deleteProjectLogo(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const storagePath = String(formData.get("storagePath") ?? "").trim();

  if (!projectId || !storagePath) {
    return { error: "Datos invalidos." };
  }

  const { supabase, user } = await requireBrokerAdmin();

  const { error: storageError } = await supabase.storage.from("property-media").remove([storagePath]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: dbError } = await supabase
    .from("projects")
    .update({
      logo_storage_path: null,
      updated_by: user.id,
    })
    .eq("id", projectId);

  revalidatePath("/admin/projects");
  return { success: true };
}

export async function uploadProjectMainImage(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const file = formData.get("file") as File;

  if (!projectId || !file || file.size === 0) {
    return { error: "Datos de archivo invalidos." };
  }

  const { supabase, user } = await requireBrokerAdmin();

  const fileExt = file.name.split(".").pop();
  const fileName = `covers/${projectId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `projects/${fileName}`;

  const { error: uploadError } = await supabase.storage.from("property-media").upload(filePath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: dbError } = await supabase
    .from("projects")
    .update({
      main_image_storage_path: filePath,
      updated_by: user.id,
    })
    .eq("id", projectId);

  if (dbError) {
    await supabase.storage.from("property-media").remove([filePath]);
    throw new Error(dbError.message);
  }

  revalidatePath("/admin/projects");
  return { success: true };
}

export async function deleteProjectMainImage(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const storagePath = String(formData.get("storagePath") ?? "").trim();

  if (!projectId || !storagePath) {
    return { error: "Datos invalidos." };
  }

  const { supabase, user } = await requireBrokerAdmin();

  const { error: storageError } = await supabase.storage.from("property-media").remove([storagePath]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: dbError } = await supabase
    .from("projects")
    .update({
      main_image_storage_path: null,
      updated_by: user.id,
    })
    .eq("id", projectId);

  if (dbError) {
    throw new Error(dbError.message);
  }

  revalidatePath("/admin/projects");
  return { success: true };
}
