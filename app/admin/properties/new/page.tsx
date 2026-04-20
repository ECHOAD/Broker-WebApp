import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PropertyEditor } from "@/components/admin/property-editor";
import { requireBrokerAdmin } from "@/lib/auth";
import { LISTING_MODE_OPTIONS, PRICE_MODE_OPTIONS, PROPERTY_STATUS_OPTIONS } from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PropertyTypeRow = Database["public"]["Tables"]["property_types"]["Row"];
type ProjectInventorySummaryRow = Database["public"]["Tables"]["project_inventory_summaries"]["Row"];

type NewPropertyPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function NewPropertyPage({ searchParams }: NewPropertyPageProps) {
  const { project: projectParam } = await searchParams;
  if (!projectParam) {
    redirect("/admin/projects");
  }

  const { supabase } = await requireBrokerAdmin();

  const [
    { data: project, error: projectError },
    { data: projectsData, error: projectsError },
    { data: propertyTypesData, error: propertyTypesError },
    { data: inventorySummariesData, error: inventorySummariesError },
  ] = await Promise.all([
    supabase.from("projects").select("id, name, status").eq("id", projectParam).single(),
    supabase.from("projects").select("id, name, status").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
    supabase.from("property_types").select("id, slug, label_es, label_en").order("label_es"),
    supabase
      .from("project_inventory_summaries")
      .select(
        "id, model_name, lot_size_min_m2, lot_size_max_m2, habitable_area_m2, construction_area_m2, price_min, price_max, available_lots, total_lots, bedrooms, bathrooms, status_note, sort_order, is_active",
      )
      .eq("project_id", projectParam)
      .order("sort_order", { ascending: true }),
  ]);

  if (projectError || !project) {
    redirect("/admin/projects");
  }

  if (projectsError || propertyTypesError || inventorySummariesError) {
    throw new Error(
      projectsError?.message ??
        propertyTypesError?.message ??
        inventorySummariesError?.message ??
        "No pudimos cargar el formulario.",
    );
  }

  const projects = (projectsData ?? []) as Array<Pick<ProjectRow, "id" | "name" | "status">>;
  const propertyTypes = (propertyTypesData ?? []) as Array<Pick<PropertyTypeRow, "id" | "slug" | "label_es" | "label_en">>;
  const inventorySummaries = (inventorySummariesData ?? []) as Pick<
    ProjectInventorySummaryRow,
    | "id"
    | "model_name"
    | "lot_size_min_m2"
    | "lot_size_max_m2"
    | "habitable_area_m2"
    | "construction_area_m2"
    | "price_min"
    | "price_max"
    | "available_lots"
    | "total_lots"
    | "bedrooms"
    | "bathrooms"
    | "status_note"
    | "sort_order"
    | "is_active"
  >[];

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6">
        <Link
          href={`/admin/properties?project=${project.id}`}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a inmuebles
        </Link>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Nuevo inmueble</p>
          <h1 className="font-serif text-4xl tracking-tight text-slate-900 m-0">{project.name}</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Crea una unidad dentro de este proyecto. El proyecto queda fijo para evitar cargar inmuebles en el inventario equivocado.
          </p>
        </div>
      </header>

      <PropertyEditor
        selectedLeadId={null}
        currentProjectId={project.id}
        currentPropertyId="new"
        selectedProjectId={project.id}
        selectedProperty={null}
        selectedPropertySummary={null}
        projectOptions={projects.map((item) => ({ value: item.id, label: item.name }))}
        inventorySummaryOptions={inventorySummaries.map((summary) => ({
          id: summary.id,
          modelName: summary.model_name,
          lotSizeMinM2: summary.lot_size_min_m2,
          lotSizeMaxM2: summary.lot_size_max_m2,
          habitableAreaM2: summary.habitable_area_m2,
          constructionAreaM2: summary.construction_area_m2,
          priceMin: summary.price_min,
          priceMax: summary.price_max,
          availableLots: summary.available_lots,
          totalLots: summary.total_lots,
          bedrooms: summary.bedrooms,
          bathrooms: summary.bathrooms,
          statusNote: summary.status_note,
          isActive: summary.is_active,
        }))}
        propertyTypeOptions={propertyTypes.map((item) => ({ value: item.id, label: item.label_es, slug: item.slug }))}
        listingModeOptions={LISTING_MODE_OPTIONS}
        propertyStatusOptions={PROPERTY_STATUS_OPTIONS}
        priceModeOptions={PRICE_MODE_OPTIONS}
      />
    </div>
  );
}
