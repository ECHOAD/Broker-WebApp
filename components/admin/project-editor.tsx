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
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (!currentProjectId) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-white/30 rounded-[40px] border-2 border-dashed border-slate-200 text-center px-6">
        <div className="max-w-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl text-slate-900">¿Qué quieres hacer hoy?</h3>
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

      {/* BARRA DE ACCIÓN PRINCIPAL */}
      <div className="sticky top-6 z-50">
        <div className="bg-white/95 backdrop-blur-xl border border-blue-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[2.5rem] p-3 pl-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-inner",
              isNew ? "bg-blue-600 text-white" : "bg-emerald-50 text-emerald-600"
            )}>
              {isNew ? <Plus className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 m-0 mb-1 leading-none">
                {isNew ? "Paso 1: Crear nuevo" : "Editando ahora"}
              </p>
              <h2 className="font-serif text-lg text-slate-900 m-0 leading-none truncate max-w-[200px] md:max-w-md">
                {isNew ? "Nueva ficha de proyecto" : selectedProject?.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isNew && (
              <Button 
                variant="ghost"
                className="hidden md:flex text-slate-400 hover:text-red-600 rounded-2xl h-12 px-6 font-bold text-[11px] uppercase tracking-widest" 
                formAction={archiveProject} 
                type="submit"
              >
                <Archive className="w-4 h-4 mr-2" />
                Quitar de la web
              </Button>
            )}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] h-12 px-10 font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-blue-100 transition-all active:scale-95" type="submit">
              <Save className="w-4 h-4 mr-2" />
              {isNew ? "Guardar y Continuar" : "Guardar todos los cambios"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* COLUMNA DE CONTENIDO */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* PASO 1: NOMBRE Y SITIO */}
          <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900">
              <Info className="w-24 h-24" />
            </div>
            
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-3 text-slate-900">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">1</span>
                <h3 className="font-serif text-2xl m-0">Datos de Identidad</h3>
              </div>
              <p className="text-sm text-slate-500 pl-11">Así es como identificaremos este proyecto en el sistema y en internet.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <FormField 
                label="Nombre del Proyecto" 
                hint="Es el nombre comercial. Ej: Ocean Sky Residences."
              >
                <Input 
                  defaultValue={selectedProject?.name ?? ""} 
                  name="name" 
                  required 
                  placeholder="Escribe el nombre aquí..."
                />
              </FormField>
              <FormField 
                label="Enlace en la Web" 
                hint="Es la dirección única del proyecto en internet. Se genera automáticamente si lo dejas vacío."
              >
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input 
                    defaultValue={selectedProject?.slug ?? ""} 
                    name="slug" 
                    placeholder="ejemplo-mi-proyecto"
                    className="pl-11"
                  />
                </div>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <FormField 
                label="Ubicación Principal" 
                hint="Selecciona una zona estandarizada para que los clientes puedan filtrar por localidad."
              >
                <SearchableSelect
                  options={locationOptions}
                  value={selectedLocationId}
                  onChange={setSelectedLocationId}
                  placeholder="Selecciona una zona..."
                />
              </FormField>

              <FormField 
                label="Detalle de Dirección" 
                hint="Información adicional sobre la ubicación (opcional)."
              >
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    defaultValue={selectedProject?.approximateLocationText ?? ""} 
                    name="approximateLocationText" 
                    placeholder="Ej: Cerca de Playa Juanillo"
                    className="pl-11"
                  />
                </div>
              </FormField>
            </div>
          </section>

          {/* PASO 2: TEXTOS PARA EL CLIENTE */}
          <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-slate-900">
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">2</span>
                <h3 className="font-serif text-2xl m-0">Textos para el Cliente</h3>
              </div>
              <p className="text-sm text-slate-500 pl-11">Esta es la información que verán las personas que visiten tu página.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start text-slate-900">
              <HelpCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Consejo de Ventas</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Utiliza palabras que evoquen lujo y comodidad. Asegúrate de mencionar las mejores amenidades del proyecto en la descripción larga.</p>
              </div>
            </div>

            <FormField 
              label="Frase de Bienvenida (Título)" 
              hint="Es el texto grande que impacta al entrar a la ficha del proyecto."
            >
              <Input 
                defaultValue={selectedProject?.headline ?? ""} 
                name="headline" 
                placeholder="Ej: El paraíso que siempre soñaste"
                className="font-serif text-xl italic"
              />
            </FormField>

            <FormField 
              label="Resumen Breve" 
              hint="Se usa en las tarjetas del catálogo. Manténlo entre 150 y 200 caracteres."
            >
              <Textarea 
                defaultValue={selectedProject?.summary ?? ""} 
                name="summary" 
                placeholder="Cuéntales de qué trata este proyecto..."
              />
            </FormField>

            <FormField 
              label="Descripción Detallada" 
              hint="Aquí va toda la información extensa. Puedes incluir listas de amenidades y detalles de construcción."
            >
              <Textarea 
                defaultValue={selectedProject?.description ?? ""} 
                name="description" 
                className="min-h-[400px]"
                placeholder="Explica todos los detalles, amenidades, precios desde, terminaciones..."
              />
            </FormField>
          </section>
        </div>

        {/* COLUMNA DE AJUSTES */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* VISIBILIDAD */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 text-slate-900">
              <Globe className="w-5 h-5 text-slate-400" />
              <h3 className="font-serif text-xl m-0">Ajustes Web</h3>
            </div>

            <div className="space-y-8">
              <FormField 
                label="¿Quién puede ver esto?" 
                hint="Controla si el proyecto es visible para el público o si aún está en preparación."
              >
                <SelectField
                  label=""
                  value={selectedProject?.status ?? "draft"}
                  name="status"
                >
                  {simpleStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </SelectField>
              </FormField>

              <div className="grid grid-cols-2 gap-6">
                <FormField 
                  label="Posición" 
                  hint="Determina el orden en el listado. Números menores aparecen primero."
                >
                  <Input 
                    defaultValue={String(selectedProject?.sortOrder ?? 0)} 
                    name="sortOrder" 
                    type="number" 
                    className="font-bold text-center text-lg"
                  />
                </FormField>
                <FormField 
                  label="WhatsApp" 
                  hint="Si incluyes un número aquí, las consultas de este proyecto irán directo a ese móvil."
                >
                  <Input 
                    defaultValue={selectedProject?.whatsappPhone ?? ""} 
                    name="whatsappPhone" 
                    placeholder="+1..."
                  />
                </FormField>
              </div>

              <Switch 
                label="Destacar Proyecto"
                description="Se mostrará en la portada"
                name="isFeatured"
                defaultChecked={selectedProject?.isFeatured ?? false}
                icon={<Star className={cn("w-5 h-5", selectedProject?.isFeatured && "fill-current")} />}
              />
            </div>
          </section>

          {/* FOTOS Y LOGO */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 text-slate-900">
              <ImageIcon className="w-5 h-5 text-slate-400" />
              <h3 className="font-serif text-xl m-0">Fotos y Logo</h3>
            </div>

            {!isNew && selectedProject ? (
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Foto Principal</h4>
                    {selectedProject.mainImageStoragePath ? (
                      <Badge className="bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase border-none px-2">Subida</Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-600 text-[8px] font-bold uppercase border-none px-2">Pendiente</Badge>
                    )}
                  </div>
                  <ProjectImageUploader 
                    projectId={selectedProject.id} 
                    initialImagePath={selectedProject.mainImageStoragePath} 
                  />
                </div>

                <div className="pt-8 border-t border-slate-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Logo del Proyecto</h4>
                    {selectedProject.logoStoragePath ? (
                      <Badge className="bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase border-none px-2">Subida</Badge>
                    ) : (
                      <Badge className="bg-slate-50 text-slate-400 text-[8px] font-bold uppercase border-none px-2">Opcional</Badge>
                    )}
                  </div>
                  <ProjectLogoUploader 
                    projectId={selectedProject.id} 
                    initialLogoPath={selectedProject.logoStoragePath} 
                  />
                </div>
              </div>
            ) : (
              <div className="py-12 px-6 bg-blue-50/50 rounded-[2.5rem] border border-dashed border-blue-100 flex flex-col items-center text-center gap-4 text-slate-900">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-400">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-blue-900">Habilitar Fotos</p>
                  <p className="text-xs text-blue-600 leading-relaxed font-medium">
                    Primero guarda los datos básicos del proyecto arriba para poder subir sus fotos.
                  </p>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </form>
  );
}
