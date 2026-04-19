"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deletePropertyMediaBulk,
  deletePropertyMedia,
  registerUploadedPropertyMedia,
  removeUploadedPropertyStorage,
  setPropertyCoverMedia,
} from "@/app/admin/properties/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadPropertyFilesDirect } from "./property-media-upload";

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
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const selectedMedia = initialMedia.filter((media) => selectedMediaIds.includes(media.id));

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ completed: 0, total: files.length });
    let uploadedPaths: string[] = [];

    try {
      uploadedPaths = await uploadPropertyFilesDirect(propertyId, files, setUploadProgress);
      await registerUploadedPropertyMedia(propertyId, uploadedPaths);
      router.refresh();
    } catch (error) {
      console.error("Upload failed:", error);
      if (uploadedPaths.length > 0) {
        await removeUploadedPropertyStorage(uploadedPaths);
      }
      alert("Fallo al subir la imagen.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
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
      setSelectedMediaIds((current) => current.filter((id) => id !== mediaId));
      router.refresh();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Fallo al eliminar la imagen.");
    }
  }

  async function handleSetCover(mediaId: string) {
    const formData = new FormData();
    formData.append("propertyId", propertyId);
    formData.append("mediaId", mediaId);

    try {
      await setPropertyCoverMedia(formData);
      router.refresh();
    } catch (error) {
      console.error("Cover update failed:", error);
      alert("Fallo al cambiar la portada.");
    }
  }

  function handleToggleSelected(mediaId: string) {
    setSelectedMediaIds((current) =>
      current.includes(mediaId) ? current.filter((id) => id !== mediaId) : [...current, mediaId],
    );
  }

  function handleSelectAll() {
    setSelectedMediaIds((current) =>
      current.length === initialMedia.length ? [] : initialMedia.map((media) => media.id),
    );
  }

  async function handleBulkDelete() {
    if (selectedMedia.length === 0) {
      return;
    }

    if (!confirm(`Eliminar ${selectedMedia.length} imagen${selectedMedia.length === 1 ? "" : "es"} seleccionada${selectedMedia.length === 1 ? "" : "s"}?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("propertyId", propertyId);
    selectedMedia.forEach((media) => {
      formData.append("mediaId", media.id);
    });

    setIsDeletingBulk(true);

    try {
      await deletePropertyMediaBulk(formData);
      setSelectedMediaIds([]);
      router.refresh();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Fallo al eliminar las imagenes seleccionadas.");
    } finally {
      setIsDeletingBulk(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="eyebrow">Imagenes de la propiedad</p>
          {selectedMediaIds.length > 0 ? (
            <p className="m-0 text-sm text-muted">
              {selectedMediaIds.length} seleccionada{selectedMediaIds.length === 1 ? "" : "s"}.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {initialMedia.length > 0 ? (
            <Button type="button" variant="secondary" onClick={handleSelectAll} disabled={isUploading || isDeletingBulk}>
              {selectedMediaIds.length === initialMedia.length ? "Limpiar seleccion" : "Seleccionar todas"}
            </Button>
          ) : null}
          {selectedMediaIds.length > 0 ? (
            <Button type="button" variant="secondary" onClick={handleBulkDelete} disabled={isUploading || isDeletingBulk}>
              {isDeletingBulk ? "Eliminando..." : "Eliminar seleccionadas"}
            </Button>
          ) : null}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={isUploading || isDeletingBulk}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
            />
            <Button type="button" variant="secondary" disabled={isUploading || isDeletingBulk}>
              {isUploading ? "Subiendo..." : "Subir imagenes"}
            </Button>
          </div>
        </div>
      </div>
      {uploadProgress ? (
        <p className="m-0 text-sm text-muted">
          Subiendo {uploadProgress.completed} de {uploadProgress.total} imagenes directo a Supabase.
        </p>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {initialMedia.map((media) => {
          const { data } = supabase.storage
            .from("property-media")
            .getPublicUrl(media.storage_path);

          return (
            <Card key={media.id} className="relative aspect-square overflow-hidden group">
              <label className="absolute left-2 top-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-sm">
                <input
                  aria-label="Seleccionar imagen"
                  checked={selectedMediaIds.includes(media.id)}
                  className="h-4 w-4 accent-slate-900"
                  disabled={isUploading || isDeletingBulk}
                  onChange={() => handleToggleSelected(media.id)}
                  type="checkbox"
                />
              </label>
              <img
                src={data.publicUrl}
                alt="Property"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!media.is_cover ? (
                  <Button
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() => handleSetCover(media.id)}
                  >
                    Hacer portada
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() => handleDelete(media.id, media.storage_path)}
                >
                  Eliminar
                </Button>
              </div>
              {media.is_cover && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-white text-[10px] uppercase tracking-wider rounded">
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
