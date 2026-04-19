"use client";

import { createClient } from "@/lib/supabase/client";

const BATCH_SIZE = 4;

type UploadProgress = {
  completed: number;
  total: number;
};

const getFileExtension = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return extension || "jpg";
};

const buildStoragePath = (propertyId: string, file: File) => {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  return `properties/${propertyId}/${id}.${getFileExtension(file)}`;
};

export async function uploadPropertyFilesDirect(
  propertyId: string,
  files: File[],
  onProgress?: (progress: UploadProgress) => void,
) {
  const supabase = createClient();
  const uploadedPaths: string[] = [];
  let completed = 0;

  for (let index = 0; index < files.length; index += BATCH_SIZE) {
    const batch = files.slice(index, index + BATCH_SIZE);

    await Promise.all(
      batch.map(async (file) => {
        const storagePath = buildStoragePath(propertyId, file);
        const { error } = await supabase.storage.from("property-media").upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type || undefined,
          upsert: false,
        });

        if (error) {
          throw error;
        }

        uploadedPaths.push(storagePath);
        completed += 1;
        onProgress?.({ completed, total: files.length });
      }),
    );
  }

  return uploadedPaths;
}
