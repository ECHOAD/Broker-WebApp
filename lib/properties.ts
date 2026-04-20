import { Database } from "@/lib/supabase/database.types";
import { createPublicClient } from "@/lib/supabase/public";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyMediaRow = Database["public"]["Tables"]["property_media"]["Row"];
type PropertyTypeRow = Database["public"]["Tables"]["property_types"]["Row"];
const PROPERTY_SELECT =
  "id, project_id, property_type_id, slug, title, summary, description, listing_mode, commercial_status, price_mode, base_currency, price_amount, price_min_amount, price_max_amount, bedrooms, bathrooms, parking_spaces, construction_area_m2, lot_area_m2, lot_area_min_m2, lot_area_max_m2, approximate_location_text, whatsapp_phone, custom_features, is_featured";
const PROPERTY_SELECT_FALLBACK =
  "id, project_id, property_type_id, slug, title, summary, description, listing_mode, commercial_status, price_mode, base_currency, price_amount, bedrooms, bathrooms, parking_spaces, construction_area_m2, lot_area_m2, approximate_location_text, whatsapp_phone, is_featured";

export type PropertyDynamicFeature = {
  group: string;
  label: string;
  value: string;
};

export type PropertyGalleryImage = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  isCover: boolean;
};

export type PropertyCardData = {
  id: string;
  slug: string;
  title: string;
  badge: string;
  project: string;
  projectSlug: string | null;
  type: string;
  listingMode: string;
  status: string;
  location: string;
  priceLabel: string;
  priceAmount: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string;
  pitch: string;
  coverImageUrl: string | null;
};

export type PropertyDetailData = PropertyCardData & {
  id: string;
  story: string;
  headline: string | null;
  description: string;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  dynamicFeatures: PropertyDynamicFeature[];
  galleryImages: PropertyGalleryImage[];
  highlights: string[];
  whatsappPhone: string | null;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
    maximumFractionDigits: amount >= 1000000 ? 2 : 0,
  }).format(amount);
}

function formatAreaSquareMeters(value: number) {
  return new Intl.NumberFormat("es-DO", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);
}

function formatAreaLabel(property: PropertyRow) {
  const parts: string[] = [];

  if (property.construction_area_m2) {
    parts.push(`${formatAreaSquareMeters(property.construction_area_m2)} m² interiores`);
  }

  if (property.lot_area_min_m2 || property.lot_area_max_m2) {
    const min = property.lot_area_min_m2;
    const max = property.lot_area_max_m2;
    const lotRange =
      min && max && min !== max
        ? `${formatAreaSquareMeters(min)} - ${formatAreaSquareMeters(max)} m² lote`
        : `${formatAreaSquareMeters(min ?? max ?? 0)} m² lote`;
    parts.push(lotRange);
  } else if (property.lot_area_m2) {
    parts.push(`${formatAreaSquareMeters(property.lot_area_m2)} m² lote`);
  }

  return parts.join(" · ") || "Área a solicitud";
}

function translateListingMode(mode: PropertyRow["listing_mode"]) {
  switch (mode) {
    case "sale":
      return "Venta";
    case "rent":
      return "Renta";
    case "sale_rent":
      return "Venta / Renta";
  }
}

function translateStatus(status: PropertyRow["commercial_status"]) {
  switch (status) {
    case "available":
      return "Disponible";
    case "reserved":
      return "Reservado";
    case "sold":
      return "Vendido";
    case "rented":
      return "Rentado";
    case "hidden":
      return "Oculto";
  }
}

function resolvePriceLabel(property: PropertyRow) {
  if (property.price_mode === "on_request") {
    return "Consultar precio";
  }

  if (property.price_mode === "range") {
    const min = property.price_min_amount ?? property.price_amount;
    const max = property.price_max_amount;

    if (min !== null && max !== null && min !== max) {
      return `${formatCurrency(min, property.base_currency)} - ${formatCurrency(max, property.base_currency)}`;
    }

    if (min !== null || max !== null) {
      return `Desde ${formatCurrency(min ?? max ?? 0, property.base_currency)}`;
    }

    return "Consultar precio";
  }

  if (property.price_amount === null) {
    return "Consultar precio";
  }

  return formatCurrency(property.price_amount, property.base_currency);
}

function isMissingCustomFeaturesError(error: { message?: string } | null) {
  return Boolean(error?.message?.includes("custom_features"));
}

function normalizeDynamicFeatures(value: PropertyRow["custom_features"]): PropertyDynamicFeature[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const label = typeof record.label === "string" ? record.label.trim() : "";
      const featureValue = typeof record.value === "string" ? record.value.trim() : "";
      const group = typeof record.group === "string" ? record.group.trim() : "";

      return label && featureValue ? { group, label, value: featureValue } : null;
    })
    .filter((item): item is PropertyDynamicFeature => Boolean(item));
}

function buildBadge(property: PropertyRow, project: ProjectRow | null) {
  if (property.is_featured || project?.is_featured) {
    return "Selección editorial";
  }

  return "Inventario activo";
}

function buildHighlights(
  property: PropertyRow,
  project: ProjectRow | null,
  propertyType: PropertyTypeRow | null,
) {
  const highlights: string[] = [];
  const location =
    property.approximate_location_text ??
    project?.approximate_location_text ??
    "Ubicación reservada";

  highlights.push(`${propertyType?.label_es ?? "Propiedad"} en ${location}`);

  if (property.bedrooms) {
    highlights.push(`${property.bedrooms} dormitorios`);
  }

  if (property.bathrooms) {
    highlights.push(`${property.bathrooms} baños`);
  }

  if (property.parking_spaces) {
    highlights.push(`${property.parking_spaces} parqueos`);
  }

  if (property.construction_area_m2) {
    highlights.push(`${formatAreaSquareMeters(property.construction_area_m2)} m² interiores`);
  }

  if (property.lot_area_min_m2 || property.lot_area_max_m2) {
    const min = property.lot_area_min_m2;
    const max = property.lot_area_max_m2;
    highlights.push(
      min && max && min !== max
        ? `${formatAreaSquareMeters(min)} - ${formatAreaSquareMeters(max)} m² de lote`
        : `${formatAreaSquareMeters(min ?? max ?? 0)} m² de lote`,
    );
  } else if (property.lot_area_m2) {
    highlights.push(`${formatAreaSquareMeters(property.lot_area_m2)} m² de lote`);
  }

  for (const feature of normalizeDynamicFeatures(property.custom_features)) {
    highlights.push(`${feature.label}: ${feature.value}`);
  }

  return highlights.slice(0, 5);
}

function resolveCoverImage(
  propertyId: string,
  mediaByPropertyId: Map<string, PropertyMediaRow[]>,
  buildPublicUrl: (bucket: string, path: string) => string,
) {
  const media = mediaByPropertyId.get(propertyId) ?? [];
  const cover = media.find((item) => item.is_cover) ?? media[0];

  if (!cover) {
    return null;
  }

  return buildPublicUrl(cover.storage_bucket, cover.storage_path);
}

function resolveGalleryImages(
  property: PropertyRow,
  mediaByPropertyId: Map<string, PropertyMediaRow[]>,
  buildPublicUrl: (bucket: string, path: string) => string,
): PropertyGalleryImage[] {
  const media = mediaByPropertyId.get(property.id) ?? [];

  return media
    .map((item) => ({
      id: item.id,
      url: buildPublicUrl(item.storage_bucket, item.storage_path),
      alt: item.alt_text ?? property.title,
      caption: item.caption,
      isCover: item.is_cover,
    }))
    .sort((left, right) => Number(right.isCover) - Number(left.isCover));
}

function mapPropertyRecord(
  property: PropertyRow,
  project: ProjectRow | null,
  propertyType: PropertyTypeRow | null,
  mediaByPropertyId: Map<string, PropertyMediaRow[]>,
  buildPublicUrl: (bucket: string, path: string) => string,
): PropertyDetailData {
  const location =
    property.approximate_location_text ??
    project?.approximate_location_text ??
    "Ubicación reservada";
  const summary =
    property.summary ??
    project?.summary ??
    "Activos seleccionados con narrativa, precisión comercial y lectura pública limpia.";
  const description =
    property.description ??
    project?.description ??
    "El detalle completo estará disponible cuando se cargue la narrativa editorial definitiva.";

  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    badge: buildBadge(property, project),
    project: project?.name ?? "Selección privada",
    projectSlug: project?.slug ?? null,
    headline: project?.headline ?? null,
    type: propertyType?.label_es ?? "Propiedad",
    listingMode: translateListingMode(property.listing_mode),
    status: translateStatus(property.commercial_status),
    location,
    priceLabel: resolvePriceLabel(property),
    priceAmount: property.price_min_amount ?? property.price_amount,
    area: formatAreaLabel(property),
    pitch: summary,
    story: description,
    description,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    parkingSpaces: property.parking_spaces,
    dynamicFeatures: normalizeDynamicFeatures(property.custom_features),
    galleryImages: resolveGalleryImages(property, mediaByPropertyId, buildPublicUrl),
    highlights: buildHighlights(property, project, propertyType),
    whatsappPhone: property.whatsapp_phone ?? project?.whatsapp_phone ?? null,
    coverImageUrl: resolveCoverImage(property.id, mediaByPropertyId, buildPublicUrl),
  };
}

async function fetchLookupMaps(properties: PropertyRow[]) {
  const supabase = createPublicClient();
  const projectIds = [
    ...new Set(
      properties
        .map((property) => property.project_id)
        .filter((projectId): projectId is string => typeof projectId === "string"),
    ),
  ];
  const propertyTypeIds = [...new Set(properties.map((property) => property.property_type_id))];
  const propertyIds = properties.map((property) => property.id);

  const {
    data: projects = [],
    error: projectsError,
  } =
    projectIds.length === 0
      ? { data: [] as ProjectRow[], error: null }
      : await supabase
          .from("projects")
          .select(
            "id, slug, name, headline, summary, description, approximate_location_text, whatsapp_phone, is_featured",
          )
          .in("id", projectIds);

  const {
    data: propertyTypes = [],
    error: propertyTypesError,
  } = await supabase
    .from("property_types")
    .select("id, slug, label_es, label_en")
    .in("id", propertyTypeIds);

  const {
    data: propertyMedia = [],
    error: propertyMediaError,
  } =
    propertyIds.length === 0
      ? { data: [] as PropertyMediaRow[], error: null }
      : await supabase
          .from("property_media")
          .select("id, property_id, storage_bucket, storage_path, alt_text, caption, is_cover, sort_order")
          .in("property_id", propertyIds)
          .order("sort_order", { ascending: true });

  if (projectsError) {
    throw new Error(projectsError.message);
  }

  if (propertyTypesError) {
    throw new Error(propertyTypesError.message);
  }

  if (propertyMediaError) {
    throw new Error(propertyMediaError.message);
  }

  const safeProjects: ProjectRow[] = (projects ?? []) as ProjectRow[];
  const safePropertyTypes: PropertyTypeRow[] = (propertyTypes ?? []) as PropertyTypeRow[];
  const safePropertyMedia: PropertyMediaRow[] = (propertyMedia ?? []) as PropertyMediaRow[];

  const projectById = new Map(safeProjects.map((project) => [project.id, project]));
  const propertyTypeById = new Map(
    safePropertyTypes.map((propertyType) => [propertyType.id, propertyType]),
  );
  const mediaByPropertyId = new Map<string, PropertyMediaRow[]>();

  for (const mediaItem of safePropertyMedia) {
    const bucket = mediaByPropertyId.get(mediaItem.property_id) ?? [];
    bucket.push(mediaItem);
    mediaByPropertyId.set(mediaItem.property_id, bucket);
  }

  const buildPublicUrl = (bucket: string, path: string) =>
    supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  return {
    buildPublicUrl,
    mediaByPropertyId,
    projectById,
    propertyTypeById,
  };
}

async function mapPublicProperties(properties: PropertyRow[]) {
  const { buildPublicUrl, mediaByPropertyId, projectById, propertyTypeById } =
    await fetchLookupMaps(properties);

  return properties.map((property) =>
    mapPropertyRecord(
      property,
      property.project_id ? projectById.get(property.project_id) ?? null : null,
      propertyTypeById.get(property.property_type_id) ?? null,
      mediaByPropertyId,
      buildPublicUrl,
    ),
  );
}

export async function listPublicProperties() {
  const supabase = createPublicClient();
  let { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (isMissingCustomFeaturesError(error)) {
    const fallback = await supabase
      .from("properties")
      .select(PROPERTY_SELECT_FALLBACK)
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  const properties: PropertyRow[] = (data ?? []) as PropertyRow[];
  return mapPublicProperties(properties);
}

export async function getFeaturedPublicProperties(limit = 3): Promise<PropertyCardData[]> {
  const properties = await listPublicProperties();
  return properties.slice(0, limit);
}

export async function getPublicPropertyBySlug(slug: string) {
  const supabase = createPublicClient();
  let { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (isMissingCustomFeaturesError(error)) {
    const fallback = await supabase
      .from("properties")
      .select(PROPERTY_SELECT_FALLBACK)
      .eq("slug", slug)
      .maybeSingle();
    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const property = data as PropertyRow;

  const { buildPublicUrl, mediaByPropertyId, projectById, propertyTypeById } =
    await fetchLookupMaps([property]);

  return mapPropertyRecord(
    property,
    property.project_id ? projectById.get(property.project_id) ?? null : null,
    propertyTypeById.get(property.property_type_id) ?? null,
    mediaByPropertyId,
    buildPublicUrl,
  );
}

export async function getPublicPropertySlugs() {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("properties").select("slug").order("created_at");

  if (error) {
    throw new Error(error.message);
  }

  const properties = (data ?? []) as Array<Pick<PropertyRow, "slug">>;
  return properties.map((property) => property.slug);
}

export async function listPublicPropertiesByIds(propertyIds: string[]) {
  if (propertyIds.length === 0) {
    return [];
  }

  const supabase = createPublicClient();
  let { data, error } = await supabase.from("properties").select(PROPERTY_SELECT).in("id", propertyIds);

  if (isMissingCustomFeaturesError(error)) {
    const fallback = await supabase.from("properties").select(PROPERTY_SELECT_FALLBACK).in("id", propertyIds);
    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  const properties = (data ?? []) as PropertyRow[];
  const mapped = await mapPublicProperties(properties);
  const propertyById = new Map(mapped.map((property) => [property.id, property]));

  return propertyIds
    .map((propertyId) => propertyById.get(propertyId))
    .filter((property): property is PropertyDetailData => Boolean(property));
}

export async function listPublicProjects() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, slug")
    .eq("status", "published")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listPublicPropertyTypes() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("property_types")
    .select("id, label_es, slug, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
export type ProjectDetailData = {
  id: string;
  name: string;
  slug: string;
  headline: string | null;
  summary: string | null;
  description: string | null;
  location: string | null;
  whatsappPhone: string | null;
  mainImageUrl: string | null;
  logoUrl: string | null;
  propertyCount: number;
  isFeatured: boolean;
  inventorySummaries: ProjectInventorySummaryData[];
};

export type ProjectInventorySummaryData = {
  id: string;
  modelName: string;
  lotSizeMinM2: number | null;
  lotSizeMaxM2: number | null;
  habitableAreaM2: number | null;
  constructionAreaM2: number | null;
  priceMin: number | null;
  priceMax: number | null;
  availableLots: number;
  totalLots: number;
  bedrooms: number | null;
  bathrooms: number | null;
  statusNote: string | null;
};

const PROJECT_SELECT = `
  id,
  name,
  slug,
  headline,
  summary,
  description,
  whatsapp_phone,
  is_featured,
  approximate_location_text,
  main_image_storage_path,
  logo_storage_path,
  properties:properties(id),
  project_inventory_summaries(
    id,
    model_name,
    lot_size_min_m2,
    lot_size_max_m2,
    habitable_area_m2,
    construction_area_m2,
    price_min,
    price_max,
    available_lots,
    total_lots,
    bedrooms,
    bathrooms,
    status_note,
    sort_order,
    is_active
  )
`;

async function mapPublicProject(project: any): Promise<ProjectDetailData> {
  const supabase = createPublicClient();

  const { data: mainImageData } = project.main_image_storage_path
    ? supabase.storage.from("property-media").getPublicUrl(project.main_image_storage_path)
    : { data: { publicUrl: null } };

  const { data: logoData } = project.logo_storage_path
    ? supabase.storage.from("property-media").getPublicUrl(project.logo_storage_path)
    : { data: { publicUrl: null } };

  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    headline: project.headline,
    summary: project.summary,
    description: project.description,
    location: project.approximate_location_text,
    whatsappPhone: project.whatsapp_phone,
    mainImageUrl: mainImageData.publicUrl,
    logoUrl: logoData.publicUrl,
    propertyCount: project.properties?.length ?? 0,
    isFeatured: project.is_featured ?? false,
    inventorySummaries: (project.project_inventory_summaries ?? [])
      .filter((summary: any) => summary.is_active !== false)
      .sort((left: any, right: any) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
      .map((summary: any) => ({
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
      })),
  };
}

export async function listPublicProjectsDetailed() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return Promise.all((data ?? []).map(mapPublicProject));
}

export async function getFeaturedPublicProjects(limit = 3) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return Promise.all((data ?? []).map(mapPublicProject));
}

export async function getPublicProjectBySlug(slug: string) {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("status", "published")
    .eq("slug", normalizedSlug)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapPublicProject(data);
}

export async function getPublicProjectBySlugOrName(projectQuery: string) {
  const normalizedQuery = projectQuery.trim();

  if (!normalizedQuery) {
    return null;
  }

  const supabase = createPublicClient();

  const { data: projectBySlug, error: slugError } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("status", "published")
    .eq("slug", normalizedQuery)
    .limit(1)
    .maybeSingle();

  if (slugError) {
    throw new Error(slugError.message);
  }

  if (projectBySlug) {
    return mapPublicProject(projectBySlug);
  }

  const { data: projectByName, error: nameError } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("status", "published")
    .eq("name", normalizedQuery)
    .limit(1)
    .maybeSingle();

  if (nameError) {
    throw new Error(nameError.message);
  }

  if (!projectByName) {
    return null;
  }

  return mapPublicProject(projectByName);
}

export async function getPublicProjectSlugs() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("slug")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<Pick<ProjectRow, "slug">>).map((project) => project.slug);
}

export async function listPublicPropertiesByProjectId(projectId: string) {
  const supabase = createPublicClient();
  let { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("project_id", projectId)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (isMissingCustomFeaturesError(error)) {
    const fallback = await supabase
      .from("properties")
      .select(PROPERTY_SELECT_FALLBACK)
      .eq("project_id", projectId)
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  const properties: PropertyRow[] = (data ?? []) as PropertyRow[];
  return mapPublicProperties(properties);
}

