"use client";

import { useState } from "react";
import { uploadProjectMainImage, deleteProjectMainImage } from "@/app/admin/projects/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Trash2, UploadCloud, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectImageUploaderProps = {
  projectId: string;
  initialImagePath: string | null;
};

export function ProjectImageUploader({ projectId, initialImagePath }: ProjectImageUploaderProps) {
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
      await uploadProjectMainImage(formData);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Error al subir la imagen.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete() {
    if (!initialImagePath) return;
    if (!confirm("¿Seguro que quieres eliminar la imagen de portada?")) return;

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("storagePath", initialImagePath);

    try {
      await deleteProjectMainImage(formData);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Error al eliminar la imagen.");
    }
  }

  const { data: publicData } = initialImagePath 
    ? supabase.storage.from("property-media").getPublicUrl(initialImagePath)
    : { data: { publicUrl: null } };

  return (
    <div className="relative group">
      <Card className={cn(
        "relative aspect-[21/9] w-full overflow-hidden flex items-center justify-center bg-slate-50 border-2 border-dashed transition-all duration-500 rounded-[2.5rem]",
        initialImagePath ? "border-transparent shadow-sm" : "border-slate-200 hover:border-blue-300"
      )}>
        {publicData.publicUrl ? (
          <img
            src={publicData.publicUrl}
            alt="Project Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <UploadCloud className="w-10 h-10 opacity-20" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Sube una foto panorámica</span>
          </div>
        )}

        {/* OVERLAY ACTIONS */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <Button 
              type="button"
              className="bg-white text-slate-900 hover:bg-white rounded-full h-12 px-6 font-bold text-[10px] uppercase tracking-widest shadow-xl"
              disabled={isUploading}
            >
              {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : initialImagePath ? "Cambiar Foto" : "Seleccionar Foto"}
            </Button>
          </div>
          
          {initialImagePath && (
            <Button 
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700 rounded-full w-12 h-12 p-0 shadow-xl"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
