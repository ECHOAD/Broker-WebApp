import { createClient } from "@/lib/supabase/server";
import { requireBrokerAdmin } from "@/lib/auth";
import { PROJECT_STATUS_LABELS } from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus, Search, Filter, Briefcase, ChevronRight, LayoutGrid, Globe, Clock, Star } from "lucide-react";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

type ProjectsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { q, status, page } = await searchParams;
  const { supabase } = await requireBrokerAdmin();

  const currentPage = parseInt(page ?? "1");
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("projects")
    .select("*, properties:properties(id)", { count: "exact" });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  if (status && status !== "all") {
    query = query.eq("status", status as ProjectRow["status"]);
  } else {
    // By default, don't show archived unless specifically requested
    if (!status || status === "all") {
      query = query.neq("status", "archived");
    }
  }

  const { data: projectsData, count, error: projectsError } = await query
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (projectsError) {
    throw new Error("No pudimos leer la información de los proyectos.");
  }

  const projects = projectsData ?? [];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10">
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Gestión de Activos</p>
          <h1 className="font-serif text-5xl tracking-tight text-slate-900 m-0 text-balance">Proyectos</h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed">
            Organiza tu portafolio inmobiliario. Aquí puedes gestionar los desarrollos, su visibilidad pública y contenido destacado.
          </p>
        </div>
        
        <Link 
          href="/admin/projects/new"
          className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[20px] text-sm font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Nuevo Proyecto
        </Link>
      </header>

      {/* Filters & Tools */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <form className="relative w-full md:w-[400px] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text" 
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre de proyecto..."
            className="w-full h-14 pl-14 pr-6 bg-white rounded-[22px] border border-slate-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all text-sm font-medium"
          />
        </form>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[24px]">
          {[
            { label: 'Todos', value: 'all' },
            { label: 'Públicos', value: 'published' },
            { label: 'Borradores', value: 'draft' },
            { label: 'Archivados', value: 'archived' },
          ].map((opt) => {
            const isCurrent = (status === opt.value) || (!status && opt.value === 'all');
            return (
              <Link
                key={opt.value}
                href={`/admin/projects?status=${opt.value}${q ? `&q=${q}` : ''}`}
                className={cn(
                  "px-6 py-2.5 rounded-[18px] text-[11px] font-bold uppercase tracking-wider transition-all",
                  isCurrent 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.length === 0 ? (
          <div className="col-span-full py-20">
            <EmptyState eyebrow="Proyectos" description="No se encontraron proyectos con los filtros aplicados." />
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.id}`}
              className="flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.06)] transition-all duration-500 group overflow-hidden"
            >
              {/* Cover Preview (Placeholder or real) */}
              <div className="aspect-[16/9] bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                <div className="absolute top-4 right-4 z-20">
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg",
                    project.status === 'published' ? "bg-emerald-500/90 text-white" :
                    project.status === 'draft' ? "bg-amber-500/90 text-white" :
                    "bg-slate-500/90 text-white"
                  )}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                </div>
                {/* Image would go here if we had a direct URL helper here */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <LayoutGrid className="w-10 h-10 text-slate-200 group-hover:scale-110 transition-transform duration-700" />
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1 gap-6">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-slate-900 m-0 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <Globe className="w-3.5 h-3.5" />
                    <span>/{project.slug}</span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{project.properties?.length ?? 0}</span>
                    </div>
                    {project.is_featured && (
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/projects?page=${p}${status ? `&status=${status}` : ''}${q ? `&q=${q}` : ''}`}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all",
                currentPage === p 
                  ? "bg-slate-900 text-white shadow-xl" 
                  : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
