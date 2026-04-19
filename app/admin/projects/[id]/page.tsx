import { requireBrokerAdmin } from "@/lib/auth";
import { ProjectEditor } from "@/components/admin/project-editor";
import { PROJECT_STATUS_OPTIONS, listLocations } from "@/lib/admin";
import Link from "next/link";
import { Building2, ChevronLeft, ClipboardList } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type ProjectEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { id } = await params;
  const { supabase } = await requireBrokerAdmin();

  const [projectResult, locations, propertiesResult] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single(),
    listLocations(),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("project_id", id),
  ]);

  const { data: project, error } = projectResult;

  if (error || !project) {
    notFound();
  }

  const selectedProjectData = {
    id: project.id,
    name: project.name,
    slug: project.slug,
    status: project.status,
    sortOrder: project.sort_order,
    whatsappPhone: project.whatsapp_phone,
    headline: project.headline,
    approximateLocationText: project.approximate_location_text,
    locationId: project.location_id,
    summary: project.summary,
    description: project.description,
    isFeatured: project.is_featured,
    logoStoragePath: project.logo_storage_path,
    mainImageStoragePath: project.main_image_storage_path,
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-6">
        <Link 
          href="/admin/projects" 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al listado
        </Link>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Edición de Proyecto</p>
          <h1 className="font-serif text-4xl tracking-tight text-slate-900 m-0">{project.name}</h1>
        </div>
        <Link
          href={`/admin/properties?project=${project.id}`}
          className="inline-flex h-12 w-fit items-center justify-center gap-3 rounded-[18px] border border-slate-200 bg-white px-6 text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-xl shadow-slate-200/70 transition-all hover:border-slate-300 hover:text-slate-950"
        >
          <Building2 className="h-4 w-4" />
          Inmuebles
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{propertiesResult.count ?? 0}</span>
        </Link>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-800">1</span>
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-widest text-slate-900">Proyecto</p>
                <p className="m-0 text-xs text-slate-400">Marca, portada, narrativa y visibilidad.</p>
              </div>
            </div>
          </div>
          <Link href={`/admin/properties?project=${project.id}`} className="rounded-2xl border border-slate-100 bg-white/60 p-4 transition-colors hover:bg-white">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">2</span>
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-widest text-slate-900">Inmuebles</p>
                <p className="m-0 text-xs text-slate-400">Unidades, precios, media y disponibilidad.</p>
              </div>
              <ClipboardList className="ml-auto h-4 w-4 text-slate-300" />
            </div>
          </Link>
        </div>
      </header>

      <ProjectEditor
        selectedLeadId={null}
        currentProjectId={project.id}
        currentPropertyId={null}
        selectedProject={selectedProjectData}
        statusOptions={PROJECT_STATUS_OPTIONS}
        locations={locations}
      />
    </div>
  );
}
