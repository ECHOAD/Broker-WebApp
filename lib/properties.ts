import { Database } from "@/lib/supabase/database.types";
import { createPublicClient } from "@/lib/supabase/public";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyMediaRow = Database["public"]["Tables"]["property_media"]["Row"];
type PropertyTypeRow = Database["public"]["Tables"]["property_types"]["Row"];
const PROPERTY_SELECT =
  "id, project_id, property_type_id, slug, title, summary, description, listing_mode, commercial_status, price_mode, base_currency, price_amount, bedrooms, bathrooms, parking_spaces, construction_area_m2, lot_area_m2, approximate_location_text, whatsapp_phone, is_featured";

export type PropertyCardData = {
  id: string;
  slug: string;
  title: string;
  badge: string;
  project: string;
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
  projectSlug: string | null;
  headline: string | null;
  description: string;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
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

  if (property.lot_area_m2) {
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
  if (property.price_mode === "on_request" || property.price_amount === null) {
    return "Consultar precio";
  }

  return formatCurrency(property.price_amount, property.base_currency);
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

  if (property.lot_area_m2) {
    highlights.push(`${formatAreaSquareMeters(property.lot_area_m2)} m² de lote`);
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
    priceAmount: property.price_amount,
    area: formatAreaLabel(property),
    pitch: summary,
    story: description,
    description,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    parkingSpaces: property.parking_spaces,
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
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

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
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

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
  const { data, error } = await supabase.from("properties").select(PROPERTY_SELECT).in("id", propertyIds);

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
