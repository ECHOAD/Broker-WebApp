"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBrokerAdmin } from "@/lib/auth";
import { slugify, toNullableText, toNullableInteger } from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";

type ProjectStatus = Database["public"]["Enums"]["project_status"];

const ALLOWED_PROJECT_STATUSES: ProjectStatus[] = ["draft", "published", "archived"];

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
