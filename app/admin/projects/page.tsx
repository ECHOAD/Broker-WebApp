import { requireBrokerAdmin } from "@/lib/auth";
import { PROJECT_STATUS_LABELS } from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus, Search, ChevronRight, Globe, Star, Building2, Pencil, Image as ImageIcon } from "lucide-react";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectStatus = ProjectRow["status"];

type ProjectPropertySummary = {
  id: string;
  property_type_id: string;
  property_types: { label_es: string } | { label_es: string }[] | null;
};

type ProjectTableRow = Pick<
  ProjectRow,
  "id" | "name" | "slug" | "status" | "is_featured" | "sort_order" | "main_image_storage_path"
> & {
  properties: ProjectPropertySummary[];
};

type ProjectsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const getStatusClasses = (status: ProjectStatus) => {
  if (status === "published") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (status === "draft") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  return "bg-slate-100 text-slate-600 border-slate-200";
};

const getPropertyTypeLabel = (property: ProjectPropertySummary) => {
  const relation = property.property_types;
  if (Array.isArray(relation)) {
    return relation[0]?.label_es ?? "Sin tipo";
  }

  return relation?.label_es ?? "Sin tipo";
};

const summarizePropertyTypes = (properties: ProjectPropertySummary[]) => {
  const counts = new Map<string, number>();

  for (const property of properties) {
    const label = getPropertyTypeLabel(property);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([label, amount]) => ({ label, amount }));
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { q, status, page } = await searchParams;
  const { supabase } = await requireBrokerAdmin();

  const currentPage = parseInt(page ?? "1");
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("projects")
    .select(
      "id, name, slug, status, is_featured, sort_order, main_image_storage_path, properties:properties(id, property_type_id, property_types(label_es))",
      { count: "exact" },
    );

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

  const projects = (projectsData ?? []) as unknown as ProjectTableRow[];
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
          className="inline-flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-slate-700 shadow-xl shadow-slate-200/70 transition-all hover:border-slate-300 hover:text-slate-950 hover:shadow-2xl group"
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

      <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.04)]">
        {projects.length === 0 ? (
          <div className="py-20">
            <EmptyState eyebrow="Proyectos" description="No se encontraron proyectos con los filtros aplicados." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Proyecto</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Inmuebles</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Tipos de inmueble</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Orden</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projects.map((project) => {
                  const coverUrl = project.main_image_storage_path
                    ? supabase.storage.from("property-media").getPublicUrl(project.main_image_storage_path).data.publicUrl
                    : null;
                  const propertyTypes = summarizePropertyTypes(project.properties ?? []);
                  const propertyCount = project.properties?.length ?? 0;

                  return (
                    <tr key={project.id} className="group transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                            {coverUrl ? (
                              <img src={coverUrl} alt={`Portada de ${project.name}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-300">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/projects/${project.id}`} className="font-serif text-xl text-slate-900 transition-colors hover:text-slate-600">
                                {project.name}
                              </Link>
                              {project.is_featured ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : null}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-400">
                              <Globe className="h-3.5 w-3.5" />
                              <span>/{project.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn("inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest", getStatusClasses(project.status))}>
                          {PROJECT_STATUS_LABELS[project.status]}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-3xl text-slate-900">{propertyCount}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">unidades</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {propertyTypes.length > 0 ? (
                          <div className="flex max-w-[320px] flex-wrap gap-2">
                            {propertyTypes.map((type) => (
                              <span key={type.label} className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                {type.label} · {type.amount}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Sin inmuebles</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-500">{project.sort_order}</td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all hover:border-slate-200 hover:text-slate-900 hover:shadow-sm"
                          >
                            <Pencil className="h-4 w-4" />
                            Formulario
                          </Link>
                          <Link
                            href={`/admin/properties?project=${project.id}`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-slate-700 transition-all hover:border-slate-300 hover:text-slate-950 hover:shadow-sm"
                          >
                            <Building2 className="h-4 w-4" />
                            Inmuebles
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
                  ? "bg-white text-slate-950 shadow-xl border-slate-300" 
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
