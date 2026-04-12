import { requireBrokerAdmin } from "@/lib/auth";
import { ProjectEditor } from "@/components/admin/project-editor";
import { PROJECT_STATUS_OPTIONS, listLocations } from "@/lib/admin";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireBrokerAdmin();
  const locations = await listLocations();

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
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Nuevo Registro</p>
          <h1 className="font-serif text-4xl tracking-tight text-slate-900 m-0">Crear Proyecto</h1>
        </div>
      </header>

      <ProjectEditor
        selectedLeadId={null}
        currentProjectId="new"
        currentPropertyId={null}
        selectedProject={null}
        statusOptions={PROJECT_STATUS_OPTIONS}
        locations={locations}
      />
    </div>
  );
}
