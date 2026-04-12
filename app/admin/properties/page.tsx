import { Card, CardContent } from "@/components/ui/card";
import { PropertyEditor } from "@/components/admin/property-editor";
import { createClient } from "@/lib/supabase/server";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_OPTIONS,
  LISTING_MODE_LABELS,
  LISTING_MODE_OPTIONS,
  PRICE_MODE_OPTIONS,
  formatCurrency,
} from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyTypeRow = Database["public"]["Tables"]["property_types"]["Row"];

type PropertiesPageProps = {
  searchParams: Promise<{
    property?: string;
    project?: string;
  }>;
};

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
  | "is_featured"
  | "created_at"
  | "published_at"
> & {
  property_media: Array<{ id: string; storage_path: string; is_cover: boolean }>;
};

export const dynamic = "force-dynamic";

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const { property: propertyParam, project: projectParam } = await searchParams;
  const supabase = await createClient();

  const [
    { data: propertiesData, error: propertiesError },
    { data: projectsData, error: projectsError },
    { data: propertyTypesData, error: propertyTypesError },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select(
        "id, project_id, property_type_id, slug, title, summary, description, listing_mode, commercial_status, price_mode, base_currency, price_amount, bedrooms, bathrooms, parking_spaces, construction_area_m2, lot_area_m2, approximate_location_text, whatsapp_phone, is_featured, created_at, published_at, property_media(id, storage_path, is_cover)",
      )
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name, status")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("property_types").select("id, slug, label_es, label_en").order("label_es"),
  ]);

  if (propertiesError || projectsError || propertyTypesError) {
    throw new Error(
      propertiesError?.message ?? projectsError?.message ?? propertyTypesError?.message ?? "No pudimos leer las propiedades.",
    );
  }

  const properties = (propertiesData ?? []) as unknown as PropertyWithMedia[];
  const projects = (projectsData ?? []) as Array<Pick<ProjectRow, "id" | "name" | "status">>;
  const propertyTypes = (propertyTypesData ?? []) as Array<Pick<PropertyTypeRow, "id" | "slug" | "label_es" | "label_en">>;

  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const propertyTypeById = new Map(propertyTypes.map((propertyType) => [propertyType.id, propertyType]));
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const propertiesByProjectId = new Map<string, typeof properties>();

  for (const property of properties) {
    if (!property.project_id) continue;
    const bucket = propertiesByProjectId.get(property.project_id) ?? [];
    bucket.push(property);
    propertiesByProjectId.set(property.project_id, bucket);
  }

  const selectedPropertyFromParam =
    propertyParam && propertyParam !== "new" ? properties.find((property) => property.id === propertyParam) ?? null : null;
  const selectedProjectFromParam =
    projectParam && projectParam !== "new" ? projects.find((project) => project.id === projectParam) ?? null : null;

  let selectedProject: (typeof projects)[number] | null = null;
  if (projectParam !== "new") {
    if (selectedProjectFromParam) {
      selectedProject = selectedProjectFromParam;
    } else if (selectedPropertyFromParam?.project_id) {
      selectedProject = projectById.get(selectedPropertyFromParam.project_id) ?? null;
    } else {
      selectedProject = projects[0] ?? null;
    }
  }

  const selectedProjectProperties = selectedProject
    ? propertiesByProjectId.get(selectedProject.id) ?? []
    : properties.filter((property) => property.project_id === null);

  let selectedProperty: (typeof properties)[number] | null = null;
  if (propertyParam !== "new") {
    if (selectedPropertyFromParam) {
      selectedProperty = selectedPropertyFromParam;
    } else if (selectedProjectProperties[0]) {
      selectedProperty = selectedProjectProperties[0];
    } else {
      selectedProperty = properties[0] ?? null;
    }
  }

  const propertyItems = (selectedProject ? selectedProjectProperties : properties).map((property) => ({
    id: property.id,
    active: selectedProperty?.id === property.id,
    href: `/admin/properties?property=${property.id}`,
    title: property.title,
    description: `${propertyTypeById.get(property.property_type_id)?.label_es ?? "Tipo sin etiqueta"} | ${
      LISTING_MODE_LABELS[property.listing_mode]
    }`,
    commercialStatusLabel: PROPERTY_STATUS_LABELS[property.commercial_status],
    isFeatured: property.is_featured,
  }));

  const selectedPropertyData = selectedProperty
    ? {
        id: selectedProperty.id,
        title: selectedProperty.title,
        slug: selectedProperty.slug,
        projectId: selectedProperty.project_id,
        propertyTypeId: selectedProperty.property_type_id,
        listingMode: selectedProperty.listing_mode,
        commercialStatus: selectedProperty.commercial_status,
        priceMode: selectedProperty.price_mode,
        baseCurrency: selectedProperty.base_currency,
        priceAmount: selectedProperty.price_amount,
        whatsappPhone: selectedProperty.whatsapp_phone,
        bedrooms: selectedProperty.bedrooms,
        bathrooms: selectedProperty.bathrooms,
        parkingSpaces: selectedProperty.parking_spaces,
        constructionAreaM2: selectedProperty.construction_area_m2,
        lotAreaM2: selectedProperty.lot_area_m2,
        approximateLocationText: selectedProperty.approximate_location_text,
        summary: selectedProperty.summary,
        description: selectedProperty.description,
        isFeatured: selectedProperty.is_featured,
        publishedAt: selectedProperty.published_at,
        media: selectedProperty.property_media.map((m) => ({
          id: m.id,
          storage_path: m.storage_path,
          is_cover: m.is_cover,
        })),
      }
    : null;

  const selectedPropertySummary = selectedProperty
    ? `${formatCurrency(selectedProperty.price_amount, selectedProperty.base_currency, selectedProperty.price_mode)} | ${
        PROPERTY_STATUS_LABELS[selectedProperty.commercial_status]
      } | ${selectedProperty.published_at ? "Publicada" : "No publicada"}`
    : null;

  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.name,
  }));
  const propertyTypeOptions = propertyTypes.map((propertyType) => ({
    value: propertyType.id,
    label: propertyType.label_es,
  }));

  return (
    <Card className="admin-card admin-card--wide">
      <CardContent className="p-6">
        <PropertyEditor
          createHref="/admin/properties?property=new"
          items={propertyItems}
          selectedLeadId={null}
          currentProjectId={selectedProject?.id ?? (projectParam === "new" ? "new" : null)}
          currentPropertyId={selectedProperty?.id ?? (propertyParam === "new" ? "new" : null)}
          selectedProjectId={selectedProject?.id ?? null}
          selectedProperty={selectedPropertyData}
          selectedPropertySummary={selectedPropertySummary}
          projectOptions={projectOptions}
          propertyTypeOptions={propertyTypeOptions}
          listingModeOptions={LISTING_MODE_OPTIONS}
          propertyStatusOptions={PROPERTY_STATUS_OPTIONS}
          priceModeOptions={PRICE_MODE_OPTIONS}
        />
      </CardContent>
    </Card>
  );
}
