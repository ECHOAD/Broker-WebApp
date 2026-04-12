"use client";

import { useState } from "react";
import { uploadPropertyMedia, deletePropertyMedia } from "@/app/admin/properties/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PropertyMedia = {
  id: string;
  storage_path: string;
  is_cover: boolean;
};

type ImageUploaderProps = {
  propertyId: string;
  initialMedia: PropertyMedia[];
};

export function ImageUploader({ propertyId, initialMedia }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("propertyId", propertyId);
    formData.append("file", file);

    try {
      await uploadPropertyMedia(formData);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Fallo al subir la imagen.");
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset input
    }
  }

  async function handleDelete(mediaId: string, storagePath: string) {
    if (!confirm("¿Estas seguro de eliminar esta imagen?")) return;

    const formData = new FormData();
    formData.append("mediaId", mediaId);
    formData.append("storagePath", storagePath);

    try {
      await deletePropertyMedia(formData);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Fallo al eliminar la imagen.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Imagenes de la propiedad</p>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
          />
          <Button variant="secondary" disabled={isUploading}>
            {isUploading ? "Subiendo..." : "Subir imagen"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {initialMedia.map((media) => {
          const { data } = supabase.storage
            .from("property-media")
            .getPublicUrl(media.storage_path);

          return (
            <Card key={media.id} className="relative aspect-square overflow-hidden group">
              <img
                src={data.publicUrl}
                alt="Property"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDelete(media.id, media.storage_path)}
                >
                  Eliminar
                </Button>
              </div>
              {media.is_cover && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-[10px] uppercase tracking-wider rounded">
                  Portada
                </div>
              )}
            </Card>
          );
        })}
        {initialMedia.length === 0 && !isUploading && (
          <div className="col-span-full py-8 text-center border-2 border-dashed border-outline rounded-2xl text-muted text-sm">
            No hay imagenes cargadas todavia.
          </div>
        )}
      </div>
    </div>
  );
}
