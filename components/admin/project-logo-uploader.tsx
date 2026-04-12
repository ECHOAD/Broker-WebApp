"use client";

import { useState } from "react";
import { uploadProjectLogo, deleteProjectLogo } from "@/app/admin/projects/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadCloud, Trash2, RefreshCw, BadgeCheck, Plus } from "lucide-react";
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
    if (!confirm("¿Deseas eliminar el sello de marca del proyecto?")) return;

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
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        {/* Logo Container (The Seal) */}
        <div className={cn(
          "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden border-4 shadow-2xl",
          initialLogoPath 
            ? "bg-[#0A0A0A] border-white/10 shadow-black/20 scale-100 group-hover:scale-105" 
            : "bg-slate-50 border-slate-100 border-dashed border-2 hover:bg-slate-100"
        )}>
          {publicData.publicUrl ? (
            <img
              src={publicData.publicUrl}
              alt="Project Brand"
              className="w-full h-full object-contain p-6 filter brightness-0 invert transition-transform duration-700"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-300">
              <Plus className="w-6 h-6 mb-1 opacity-40" />
              <span className="text-[8px] font-black uppercase tracking-tighter">Sello</span>
            </div>
          )}

          {/* Overlay Interaction */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <button className="text-white text-[9px] font-bold uppercase tracking-widest bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                {isUploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Cambiar"}
              </button>
            </div>
            {initialLogoPath && (
              <button 
                type="button"
                onClick={handleDelete}
                className="text-red-400 text-[8px] font-bold uppercase hover:text-red-300 transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {initialLogoPath && (
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <BadgeCheck className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest m-0">Sello de Identidad</p>
        <p className="text-[8px] text-slate-300 italic m-0">PNG / Fondo Transparente</p>
      </div>
    </div>
  );
}
