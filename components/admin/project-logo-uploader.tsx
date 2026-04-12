"use client";

import { useState } from "react";
import { uploadProjectLogo, deleteProjectLogo } from "@/app/admin/projects/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ProjectLogoUploaderProps = {
  projectId: string;
  initialLogoPath: string | null;
};

export function ProjectLogoUploader({ projectId, initialLogoPath }: ProjectLogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("file", file);

    try {
      await uploadProjectLogo(formData);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Fallo al subir el logo.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete() {
    if (!initialLogoPath) return;
    if (!confirm("¿Estas seguro de eliminar el logo del proyecto?")) return;

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("storagePath", initialLogoPath);

    try {
      await deleteProjectLogo(formData);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Fallo al eliminar el logo.");
    }
  }

  const { data: publicData } = initialLogoPath 
    ? supabase.storage.from("property-media").getPublicUrl(initialLogoPath)
    : { data: { publicUrl: null } };

  return (
    <div className="grid gap-4">
      <p className="eyebrow">Logo del proyecto</p>
      
      <div className="flex items-start gap-6">
        <Card className="relative w-32 h-32 overflow-hidden flex items-center justify-center bg-surface-soft border-2 border-dashed border-outline/20">
          {publicData.publicUrl ? (
            <img
              src={publicData.publicUrl}
              alt="Project Logo"
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <span className="text-[10px] text-muted uppercase tracking-widest text-center px-2">
              Sin logo
            </span>
          )}
        </Card>

        <div className="grid gap-2">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
            />
            <Button variant="secondary" size="sm" disabled={isUploading}>
              {isUploading ? "Subiendo..." : "Cambiar logo"}
            </Button>
          </div>
          {initialLogoPath && (
            <Button 
              variant="tertiary" 
              size="sm" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              Eliminar logo
            </Button>
          )}
          <p className="text-[10px] text-muted max-w-[200px]">
            Se recomienda una imagen PNG con fondo transparente.
          </p>
        </div>
      </div>
    </div>
  );
}
