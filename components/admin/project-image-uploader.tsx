"use client";

import { useState } from "react";
import { uploadProjectMainImage, deleteProjectMainImage } from "@/app/admin/projects/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Trash2, UploadCloud, CheckCircle2 } from "lucide-react";
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
      alert("Error al subir la imagen de portada.");
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Imagen de Portada</span>
        </div>
        {initialImagePath && (
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            <CheckCircle2 className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase">Lista</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <Card className={cn(
            "relative aspect-[16/9] w-full overflow-hidden flex items-center justify-center bg-slate-50 border-2 border-dashed transition-all duration-500",
            initialImagePath ? "border-slate-100 shadow-sm" : "border-slate-200 hover:border-slate-300"
          )}>
            {publicData.publicUrl ? (
              <img
                src={publicData.publicUrl}
                alt="Project Cover"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300">
                <UploadCloud className="w-8 h-8 opacity-20" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-center px-4">
                  Sube una foto de alta calidad (16:9)
                </span>
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait z-20"
            />
            <Button 
              type="button"
              className="w-full h-11 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              disabled={isUploading}
            >
              {isUploading ? "Subiendo..." : initialImagePath ? "Reemplazar Foto" : "Subir Foto"}
            </Button>
          </div>
          
          {initialImagePath && (
            <Button 
              type="button"
              variant="tertiary" 
              onClick={handleDelete}
              className="w-full h-11 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 justify-center"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </Button>
          )}
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
              Esta imagen se utilizará como fondo en las tarjetas de proyectos y en el encabezado de la página del proyecto. Formato recomendado: JPG o WEBP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
