import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PropertyEditor } from "@/components/admin/property-editor";
import { requireBrokerAdmin } from "@/lib/auth";
import {
  formatCurrency,
  LISTING_MODE_OPTIONS,
  PRICE_MODE_OPTIONS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_OPTIONS,
} from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyTypeRow = Database["public"]["Tables"]["property_types"]["Row"];

type PropertyWithMedia = Pick<
  PropertyRow,
  | "id"
  | "project_id"
  | "property_type_id"
  | "slug"
  | "title"
  | "summary"
  | "description"
  | "listing_mode"
  | "commercial_status"
  | "price_mode"
  | "base_currency"
  | "price_amount"
  | "bedrooms"
  | "bathrooms"
  | "parking_spaces"
  | "construction_area_m2"
  | "lot_area_m2"
  | "approximate_location_text"
  | "whatsapp_phone"
  | "custom_features"
  | "is_featured"
  | "published_at"
> & {
  property_media: Array<{ id: string; storage_path: string; is_cover: boolean }>;
};

function normalizeCustomFeatures(value: PropertyRow["custom_features"]) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const label = typeof record.label === "string" ? record.label : "";
      const featureValue = typeof record.value === "string" ? record.value : "";
      const group = typeof record.group === "string" ? record.group : "";

      return label && featureValue ? { group, label, value: featureValue } : null;
    })
    .filter((item): item is { group: string; label: string; value: string } => Boolean(item));
}

type PropertyEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    project?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PropertyEditPage({ params, searchParams }: PropertyEditPageProps) {
  const { id } = await params;
  const { project: projectParam } = await searchParams;
  const { supabase } = await requireBrokerAdmin();

  const [
    { data: propertyData, error: propertyError },
    { data: projectsData, error: projectsError },
    { data: propertyTypesData, error: propertyTypesError },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select(
        "id, project_id, property_type_id, slug, title, summary, description, listing_mode, commercial_status, price_mode, base_currency, price_amount, bedrooms, bathrooms, parking_spaces, construction_area_m2, lot_area_m2, approximate_location_text, whatsapp_phone, custom_features, is_featured, published_at, property_media(id, storage_path, is_cover)",
      )
      .eq("id", id)
      .single(),
    supabase.from("projects").select("id, name, status").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
    supabase.from("property_types").select("id, slug, label_es, label_en").order("label_es"),
  ]);

  if (propertyError || !propertyData) {
    notFound();
  }

  const property = propertyData as unknown as PropertyWithMedia;
  const selectedProjectId = projectParam ?? property.project_id;
  if (!selectedProjectId || selectedProjectId !== property.project_id) {
    redirect(property.project_id ? `/admin/properties/${property.id}?project=${property.project_id}` : "/admin/projects");
  }

  if (projectsError || propertyTypesError) {
    throw new Error(projectsError?.message ?? propertyTypesError?.message ?? "No pudimos cargar el formulario.");
  }

  const projects = (projectsData ?? []) as Array<Pick<ProjectRow, "id" | "name" | "status">>;
  const propertyTypes = (propertyTypesData ?? []) as Array<Pick<PropertyTypeRow, "id" | "slug" | "label_es" | "label_en">>;
  const project = projects.find((item) => item.id === selectedProjectId);

  if (!project) {
    redirect("/admin/projects");
  }

  const selectedProperty = {
    id: property.id,
    title: property.title,
    slug: property.slug,
    projectId: property.project_id,
    propertyTypeId: property.property_type_id,
    listingMode: property.listing_mode,
    commercialStatus: property.commercial_status,
    priceMode: property.price_mode,
    baseCurrency: property.base_currency,
    priceAmount: property.price_amount,
    whatsappPhone: property.whatsapp_phone,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    parkingSpaces: property.parking_spaces,
    constructionAreaM2: property.construction_area_m2,
    lotAreaM2: property.lot_area_m2,
    approximateLocationText: property.approximate_location_text,
    summary: property.summary,
    description: property.description,
    customFeatures: normalizeCustomFeatures(property.custom_features),
    isFeatured: property.is_featured,
    publishedAt: property.published_at,
    media: property.property_media.map((media) => ({
      id: media.id,
      storage_path: media.storage_path,
      is_cover: media.is_cover,
    })),
  };

  const selectedPropertySummary = `${formatCurrency(property.price_amount, property.base_currency, property.price_mode)} | ${
    PROPERTY_STATUS_LABELS[property.commercial_status]
  } | ${property.published_at ? "Publicada" : "No publicada"}`;

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
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Editar inmueble</p>
          <h1 className="font-serif text-4xl tracking-tight text-slate-900 m-0">{property.title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Proyecto: <span className="font-semibold text-slate-700">{project.name}</span>
          </p>
        </div>
      </header>

      <PropertyEditor
        selectedLeadId={null}
        currentProjectId={project.id}
        currentPropertyId={property.id}
        selectedProjectId={project.id}
        selectedProperty={selectedProperty}
        selectedPropertySummary={selectedPropertySummary}
        projectOptions={projects.map((item) => ({ value: item.id, label: item.name }))}
        propertyTypeOptions={propertyTypes.map((item) => ({ value: item.id, label: item.label_es, slug: item.slug }))}
        listingModeOptions={LISTING_MODE_OPTIONS}
        propertyStatusOptions={PROPERTY_STATUS_OPTIONS}
        priceModeOptions={PRICE_MODE_OPTIONS}
      />
    </div>
  );
}
