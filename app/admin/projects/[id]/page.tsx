import { requireBrokerAdmin } from "@/lib/auth";
import { ProjectEditor } from "@/components/admin/project-editor";
import { PROJECT_STATUS_OPTIONS, listLocations } from "@/lib/admin";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type ProjectEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { id } = await params;
  const { profile, supabase } = await requireBrokerAdmin();

  const [projectResult, locations] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single(),
    listLocations()
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
      <header className="flex flex-col gap-4">
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
