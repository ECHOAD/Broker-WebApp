"use client";

import { useState } from "react";
import { uploadProjectLogo, deleteProjectLogo } from "@/app/admin/projects/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadCloud, Trash2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Logo Preview */}
      <Card className={cn(
        "relative w-28 h-28 overflow-hidden flex items-center justify-center transition-all shrink-0",
        initialLogoPath ? "bg-slate-900 border-none shadow-md" : "bg-slate-50 border-2 border-dashed border-slate-200"
      )}>
        {publicData.publicUrl ? (
          <img
            src={publicData.publicUrl}
            alt="Project Logo"
            className="w-full h-full object-contain p-4 filter brightness-0 invert"
          />
        ) : (
          <ShieldCheck className="w-8 h-8 text-slate-200" />
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 flex-1 w-full sm:w-auto">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait z-10"
          />
          <Button 
            type="button"
            className="w-full sm:w-auto h-10 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 rounded-xl text-[11px] font-bold uppercase tracking-wider px-6 shadow-sm"
            disabled={isUploading}
          >
            {isUploading ? "Subiendo..." : initialLogoPath ? "Cambiar Logo" : "Subir Logo Comercial"}
          </Button>
        </div>
        
        {initialLogoPath && (
          <button 
            type="button"
            onClick={handleDelete}
            className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5 px-1"
          >
            <Trash2 className="w-3 h-3" />
            Eliminar logo actual
          </button>
        )}
        
        <p className="text-[9px] text-slate-400 leading-relaxed font-medium max-w-[220px]">
          Se recomienda una imagen en formato **PNG con fondo transparente**.
        </p>
      </div>
    </div>
  );
}
