"use client";

import { useState } from "react";
import { archiveProject, upsertProject } from "@/app/admin/projects/actions";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select-field";
import { Switch } from "@/components/ui/switch";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ProjectLogoUploader } from "./project-logo-uploader";
import { ProjectImageUploader } from "./project-image-uploader";
import { 
  LayoutGrid, 
  Globe, 
  Type, 
  MapPin, 
  Star, 
  Archive, 
  Save, 
  Plus, 
  Settings2,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  Link as LinkIcon,
  HelpCircle,
  UploadCloud,
  Eye,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ProjectOption = {
  value: string;
  label: string;
};

type SelectedProject = {
  id: string;
  name: string;
  slug: string;
  status: string;
  sortOrder: number;
  whatsappPhone: string | null;
  headline: string | null;
  approximateLocationText: string | null;
  locationId: string | null;
  summary: string | null;
  description: string | null;
  isFeatured: boolean;
  logoStoragePath: string | null;
  mainImageStoragePath: string | null;
} | null;

type ProjectEditorProps = {
  selectedLeadId: string | null;
  currentProjectId: string | null;
  currentPropertyId: string | null;
  selectedProject: SelectedProject;
  statusOptions: ProjectOption[];
  locations: { id: string; name: string; slug: string }[];
};

export function ProjectEditor({
  selectedLeadId,
  currentProjectId,
  currentPropertyId,
  selectedProject,
  statusOptions,
  locations,
}: ProjectEditorProps) {
  const [selectedLocationId, setSelectedLocationId] = useState(selectedProject?.locationId ?? "");
  
  // State for unified flow
  const [pendingMainImage, setPendingMainImage] = useState<File | null>(null);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);

  if (!currentProjectId) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-white/30 rounded-[40px] border-2 border-dashed border-slate-200 text-center px-6">
        <div className="max-w-xs space-y-4 text-slate-900">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl">¿Qué quieres hacer hoy?</h3>
          <p className="text-sm text-slate-500">Selecciona un proyecto de la izquierda para editarlo o presiona el botón de "Nuevo" para crear uno desde cero.</p>
        </div>
      </div>
    );
  }

  const isNew = currentProjectId === "new";
  const locationOptions = locations.map(l => ({ value: l.id, label: l.name }));

  const simpleStatusOptions = [
    { value: 'draft', label: 'Borrador (Solo tú lo ves)' },
    { value: 'published', label: 'Público (Cualquiera puede verlo)' },
    { value: 'archived', label: 'Oculto / Archivado' },
  ];

  return (
    <form action={upsertProject} className="space-y-8">
      <input name="projectId" type="hidden" value={selectedProject?.id ?? ""} />
      <input name="selectedLeadId" type="hidden" value={selectedLeadId ?? ""} />
      <input name="selectedProjectId" type="hidden" value={currentProjectId ?? "new"} />
      <input name="selectedPropertyId" type="hidden" value={currentPropertyId ?? ""} />
      <input name="locationId" type="hidden" value={selectedLocationId} />

      {/* HIDDEN FILE INPUTS */}
      <input type="file" name="mainImageFile" className="hidden" id="main-image-hidden-input" onChange={(e) => setPendingMainImage(e.target.files?.[0] ?? null)} />
      <input type="file" name="logoFile" className="hidden" id="logo-hidden-input" onChange={(e) => setPendingLogo(e.target.files?.[0] ?? null)} />

      {/* BARRA DE ACCIÓN SUPERIOR */}
      <div className="sticky top-6 z-50">
        <div className="bg-white/95 backdrop-blur-xl border border-blue-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[2.5rem] p-3 pl-8 flex items-center justify-between gap-4 text-slate-900">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-inner",
              isNew ? "bg-blue-600 text-white" : "bg-emerald-50 text-emerald-600"
            )}>
              {isNew ? <Plus className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 m-0 mb-1 leading-none">
                {isNew ? "Nuevo Proyecto" : "Editando ahora"}
              </p>
              <h2 className="font-serif text-lg text-slate-900 m-0 leading-none truncate max-w-[200px] md:max-w-md">
                {isNew ? "Ficha de Registro" : selectedProject?.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isNew && (
              <>
                <Button asChild variant="tertiary" className="hidden md:flex text-slate-600 hover:text-blue-600 rounded-2xl h-12 px-6 font-bold text-[11px] uppercase tracking-widest border border-slate-100">
                  <Link href={`/proyectos/${selectedProject?.slug}`} target="_blank">
                    <Eye className="w-4 h-4 mr-2" /> Ver Preview
                  </Link>
                </Button>
                <Button variant="ghost" className="hidden md:flex text-slate-400 hover:text-red-600 rounded-2xl h-12 px-6 font-bold text-[11px] uppercase tracking-widest" formAction={archiveProject} type="submit">
                  <Archive className="w-4 h-4 mr-2" /> Archivar
                </Button>
              </>
            )}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] h-12 px-10 font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-blue-100 transition-all active:scale-95" type="submit">
              <Save className="w-4 h-4 mr-2" /> {isNew ? "Guardar Proyecto" : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>

      {/* PASO 1: FOTO DE PORTADA (FULL WIDTH) */}
      <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-8 text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">1</span>
              <h3 className="font-serif text-2xl m-0">Presencia Visual</h3>
            </div>
            <p className="text-sm text-slate-500 pl-11">Esta foto será el fondo principal del proyecto. Usa una imagen impactante.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full">
          {isNew ? (
            <label 
              htmlFor="main-image-hidden-input"
              className={cn(
                "relative aspect-[21/9] w-full overflow-hidden flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] cursor-pointer hover:bg-slate-100 transition-all group",
                pendingMainImage && "border-blue-200 bg-blue-50/30"
              )}
            >
              {pendingMainImage ? (
                <img src={URL.createObjectURL(pendingMainImage)} className="w-full h-full object-cover rounded-[2.8rem]" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all group-hover:scale-110">
                    <Camera className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Click para subir foto de portada</span>
                </div>
              )}
            </label>
          ) : (
            <ProjectImageUploader projectId={selectedProject!.id} initialImagePath={selectedProject!.mainImageStoragePath} />
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: DATOS Y TEXTOS */}
        <div className="lg:col-span-8 space-y-8 text-slate-900">
          
          {/* PASO 2: IDENTIDAD (INCLUYE LOGO) */}
          <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10 relative">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">2</span>
                <h3 className="font-serif text-2xl m-0">Identidad del Proyecto</h3>
              </div>
              <p className="text-sm text-slate-500 pl-11">Aquí definimos el nombre, la marca y dónde se ubica.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
              {/* Brand Seal Area */}
              <div className="shrink-0">
                {isNew ? (
                  <div className="flex flex-col items-center gap-4">
                    <label 
                      htmlFor="logo-hidden-input"
                      className={cn(
                        "relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-500 border-4 shadow-xl group",
                        pendingLogo ? "bg-[#0A0A0A] border-white/10" : "bg-slate-50 border-slate-100 border-dashed border-2 hover:bg-slate-100"
                      )}
                    >
                      {pendingLogo ? (
                        <img src={URL.createObjectURL(pendingLogo)} className="w-full h-full object-contain p-6 filter brightness-0 invert" alt="Logo Preview" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-300">
                          <UploadCloud className="w-6 h-6 mb-1 opacity-40" />
                          <span className="text-[8px] font-bold uppercase">Logo</span>
                        </div>
                      )}
                    </label>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Sello de Marca</p>
                  </div>
                ) : (
                  <ProjectLogoUploader projectId={selectedProject!.id} initialLogoPath={selectedProject!.logoStoragePath} />
                )}
              </div>

              {/* Identity Fields */}
              <div className="flex-1 w-full space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField label="Nombre Comercial" hint="Ej: Ocean Sky Residences.">
                    <Input defaultValue={selectedProject?.name ?? ""} name="name" required placeholder="Escribe el nombre..." className="h-14 text-lg font-medium" />
                  </FormField>
                  <FormField label="Enlace en la Web" hint="Dirección única en internet.">
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input defaultValue={selectedProject?.slug ?? ""} name="slug" placeholder="ejemplo-enlace" className="pl-11 h-14" />
                    </div>
                  </FormField>
                </div>

                <div className="pt-8 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <FormField label="Zona Principal" hint="Para los filtros del buscador.">
                    <SearchableSelect options={locationOptions} value={selectedLocationId} onChange={setSelectedLocationId} />
                  </FormField>
                  <FormField label="Referencia de Dirección" hint="Ej: Cerca de Playa Juanillo.">
                    <Input defaultValue={selectedProject?.approximateLocationText ?? ""} name="approximateLocationText" placeholder="Ubicación exacta..." className="h-14" />
                  </FormField>
                </div>
              </div>
            </div>
          </section>

          {/* PASO 3: NARRATIVA */}
          <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">3</span>
                <h3 className="font-serif text-2xl text-slate-900 m-0">Narrativa de Venta</h3>
              </div>
            </div>

            <FormField label="Frase de Bienvenida" hint="Título grande que verá el cliente.">
              <Input defaultValue={selectedProject?.headline ?? ""} name="headline" placeholder="Título impactante..." className="font-serif text-xl italic h-14" />
            </FormField>

            <FormField label="Resumen Ejecutivo" hint="Párrafo introductorio corto.">
              <Textarea defaultValue={selectedProject?.summary ?? ""} name="summary" placeholder="Cuéntales de qué trata..." />
            </FormField>

            <FormField label="Historia y Detalles" hint="Cuerpo completo del texto.">
              <Textarea defaultValue={selectedProject?.description ?? ""} name="description" className="min-h-[400px]" placeholder="Detalla amenidades, historia, etc..." />
            </FormField>
          </section>
        </div>

        {/* COLUMNA DERECHA: AJUSTES */}
        <div className="lg:col-span-4 space-y-8 text-slate-900">
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <Globe className="w-5 h-5 text-slate-400" />
              <h3 className="font-serif text-xl m-0">Ajustes Web</h3>
            </div>

            <div className="space-y-8">
              <FormField label="¿Quién puede ver esto?" hint="Control de visibilidad pública.">
                <SelectField defaultValue={selectedProject?.status ?? "draft"} name="status">
                  {simpleStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </SelectField>
              </FormField>

              <div className="grid grid-cols-2 gap-6">
                <FormField label="Posición" hint="Orden en el listado.">
                  <Input defaultValue={String(selectedProject?.sortOrder ?? 0)} name="sortOrder" type="number" className="font-bold text-center text-lg h-12" />
                </FormField>
                <FormField label="WhatsApp" hint="Número de atención.">
                  <Input defaultValue={selectedProject?.whatsappPhone ?? ""} name="whatsappPhone" placeholder="+1..." className="h-12" />
                </FormField>
              </div>

              <Switch 
                label="Destacar Proyecto"
                description="Ver en portada principal"
                name="isFeatured"
                defaultChecked={selectedProject?.isFeatured ?? false}
                icon={<Star className={cn("w-5 h-5", selectedProject?.isFeatured && "fill-current")} />}
              />
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
