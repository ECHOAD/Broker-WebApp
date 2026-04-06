import { redirect } from "next/navigation";
import { AdminAccessDenied, AdminHero, PipelinePanel } from "@/components/admin/admin-primitives";
import { LeadDetailPanel } from "@/components/admin/lead-detail-panel";
import { ProjectEditor } from "@/components/admin/project-editor";
import { PropertyEditor } from "@/components/admin/property-editor";
import { SitePage } from "@/components/layout/site-page";
import { EmptyState } from "@/components/shared/empty-state";
import { SelectionLink } from "@/components/shared/selection-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type LeadInterestRow = Database["public"]["Tables"]["lead_property_interests"]["Row"];
type LeadStatusHistoryRow = Database["public"]["Tables"]["lead_status_history"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyTypeRow = Database["public"]["Tables"]["property_types"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const STATUS_LABELS: Record<LeadRow["current_status"], string> = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  meeting_requested: "Cita solicitada",
  meeting_scheduled: "Cita agendada",
  negotiation: "Negociacion",
  closed_won: "Cierre ganado",
  closed_lost: "Cierre perdido",
  archived: "Archivado",
};

const PIPELINE_ORDER: LeadRow["current_status"][] = [
  "new",
  "contacted",
  "qualified",
  "meeting_requested",
  "meeting_scheduled",
  "negotiation",
  "closed_won",
  "closed_lost",
  "archived",
];

const PROJECT_STATUS_LABELS: Record<ProjectRow["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const PROPERTY_STATUS_LABELS: Record<PropertyRow["commercial_status"], string> = {
  available: "Disponible",
  reserved: "Reservado",
  sold: "Vendido",
  rented: "Rentado",
  hidden: "Oculto",
};

const LISTING_MODE_LABELS: Record<PropertyRow["listing_mode"], string> = {
  sale: "Venta",
  rent: "Renta",
  sale_rent: "Venta / Renta",
};

const PRICE_MODE_LABELS: Record<PropertyRow["price_mode"], string> = {
  fixed: "Precio fijo",
  on_request: "A consultar",
};

type AdminPageProps = {
  searchParams: Promise<{
    lead?: string;
    project?: string;
    property?: string;
  }>;
};

function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(amount: number | null, currency: string, priceMode: PropertyRow["price_mode"]) {
  if (priceMode === "on_request" || amount === null) {
    return "Precio a solicitud";
  }

  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
    maximumFractionDigits: amount >= 1000000 ? 2 : 0,
  }).format(amount);
}

function adminHref(params: { leadId?: string | null; projectId?: string | null; propertyId?: string | null }) {
  const searchParams = new URLSearchParams();

  if (params.leadId) searchParams.set("lead", params.leadId);
  if (params.projectId) searchParams.set("project", params.projectId);
  if (params.propertyId) searchParams.set("property", params.propertyId);

  const query = searchParams.toString();
  return query ? `/admin?${query}` : "/admin";
}

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { lead: leadParam, project: projectParam, property: propertyParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const currentProfile = profile as ProfileRow | null;

  if (!currentProfile || currentProfile.role !== "broker_admin") {
    return (
      <SitePage>
        <section className="section">
          <AdminAccessDenied />
        </section>
      </SitePage>
    );
  }

  const [
    { data: leadsData, error: leadsError },
    { data: projectsData, error: projectsError },
    { data: propertiesData, error: propertiesError },
    { data: propertyTypesData, error: propertyTypesError },
    { data: leadInterestsData, error: leadInterestsError },
    { data: leadHistoryData, error: leadHistoryError },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id, full_name, phone, email, current_status, source, created_at, meeting_interest, source_path, message")
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name, slug, status, is_featured, headline, summary, description, approximate_location_text, whatsapp_phone, sort_order, created_at, published_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("properties")
      .select("id, project_id, property_type_id, slug, title, summary, description, listing_mode, commercial_status, price_mode, base_currency, price_amount, bedrooms, bathrooms, parking_spaces, construction_area_m2, lot_area_m2, approximate_location_text, whatsapp_phone, is_featured, created_at, published_at")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("property_types").select("id, slug, label_es, label_en").order("label_es"),
    supabase.from("lead_property_interests").select("id, lead_id, property_id, source_context, created_at").order("created_at", { ascending: false }),
    supabase.from("lead_status_history").select("id, lead_id, status, note, changed_at").order("changed_at", { ascending: false }),
  ]);

  if (leadsError || projectsError || propertiesError || propertyTypesError || leadInterestsError || leadHistoryError) {
    throw new Error(
      leadsError?.message ??
        projectsError?.message ??
        propertiesError?.message ??
        propertyTypesError?.message ??
        leadInterestsError?.message ??
        leadHistoryError?.message ??
        "No pudimos leer el workspace admin.",
    );
  }

  const leads = (leadsData ?? []) as Array<
    Pick<LeadRow, "id" | "full_name" | "phone" | "email" | "current_status" | "source" | "created_at" | "meeting_interest" | "source_path" | "message">
  >;
  const projects = (projectsData ?? []) as Array<
    Pick<ProjectRow, "id" | "name" | "slug" | "status" | "is_featured" | "headline" | "summary" | "description" | "approximate_location_text" | "whatsapp_phone" | "sort_order" | "created_at" | "published_at">
  >;
  const properties = (propertiesData ?? []) as Array<
    Pick<PropertyRow, "id" | "project_id" | "property_type_id" | "slug" | "title" | "summary" | "description" | "listing_mode" | "commercial_status" | "price_mode" | "base_currency" | "price_amount" | "bedrooms" | "bathrooms" | "parking_spaces" | "construction_area_m2" | "lot_area_m2" | "approximate_location_text" | "whatsapp_phone" | "is_featured" | "created_at" | "published_at">
  >;
  const propertyTypes = (propertyTypesData ?? []) as Array<Pick<PropertyTypeRow, "id" | "slug" | "label_es" | "label_en">>;
  const leadInterests = (leadInterestsData ?? []) as Array<Pick<LeadInterestRow, "id" | "lead_id" | "property_id" | "source_context" | "created_at">>;
  const leadHistory = (leadHistoryData ?? []) as Array<Pick<LeadStatusHistoryRow, "id" | "lead_id" | "status" | "note" | "changed_at">>;

  const pipeline = PIPELINE_ORDER.map((status) => ({
    stage: STATUS_LABELS[status],
    count: leads.filter((lead) => lead.current_status === status).length,
  }));

  const snapshot = [
    { label: "Leads totales", value: String(leads.length) },
    { label: "Pendientes de respuesta", value: String(leads.filter((lead) => lead.current_status === "new").length) },
    { label: "Propiedades activas", value: String(properties.filter((property) => ["available", "reserved"].includes(property.commercial_status)).length) },
    { label: "Proyectos publicados", value: String(projects.filter((project) => project.status === "published").length) },
  ];

  const projectById = new Map(projects.map((project) => [project.id, project]));
  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const propertyTypeById = new Map(propertyTypes.map((propertyType) => [propertyType.id, propertyType]));
  const interestsByLeadId = new Map<string, typeof leadInterests>();
  const historyByLeadId = new Map<string, typeof leadHistory>();
  const propertiesByProjectId = new Map<string, typeof properties>();

  for (const interest of leadInterests) {
    const bucket = interestsByLeadId.get(interest.lead_id) ?? [];
    bucket.push(interest);
    interestsByLeadId.set(interest.lead_id, bucket);
  }

  for (const historyItem of leadHistory) {
    const bucket = historyByLeadId.get(historyItem.lead_id) ?? [];
    bucket.push(historyItem);
    historyByLeadId.set(historyItem.lead_id, bucket);
  }

  for (const property of properties) {
    if (!property.project_id) continue;
    const bucket = propertiesByProjectId.get(property.project_id) ?? [];
    bucket.push(property);
    propertiesByProjectId.set(property.project_id, bucket);
  }

  const selectedLead = leads.find((lead) => lead.id === leadParam) ?? leads[0] ?? null;
  const selectedLeadInterests = selectedLead ? interestsByLeadId.get(selectedLead.id) ?? [] : [];
  const selectedLeadHistory = selectedLead ? historyByLeadId.get(selectedLead.id) ?? [] : [];
  const selectedLeadProperties = selectedLeadInterests
    .map((interest) => propertyById.get(interest.property_id))
    .filter((property): property is NonNullable<(typeof properties)[number]> => Boolean(property));

  const selectedPropertyFromParam =
    propertyParam && propertyParam !== "new"
      ? properties.find((property) => property.id === propertyParam) ?? null
      : null;
  const selectedProjectFromParam =
    projectParam && projectParam !== "new"
      ? projects.find((project) => project.id === projectParam) ?? null
      : null;

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

  const currentProjectId = selectedProject?.id ?? (projectParam === "new" ? "new" : null);
  const currentPropertyId = selectedProperty?.id ?? (propertyParam === "new" ? "new" : null);

  const leadStatusOptions = PIPELINE_ORDER.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }));
  const projectStatusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  const listingModeOptions = Object.entries(LISTING_MODE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  const propertyStatusOptions = Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  const priceModeOptions = Object.entries(PRICE_MODE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const projectItems = projects.map((project) => ({
    id: project.id,
    active: selectedProject?.id === project.id,
    href: adminHref({
      leadId: selectedLead?.id ?? null,
      projectId: project.id,
      propertyId: null,
    }),
    name: project.name,
    headline: project.headline,
    statusLabel: PROJECT_STATUS_LABELS[project.status],
    isFeatured: project.is_featured,
  }));

  const propertyItems = (selectedProject ? selectedProjectProperties : properties).map((property) => ({
    id: property.id,
    active: selectedProperty?.id === property.id,
    href: adminHref({
      leadId: selectedLead?.id ?? null,
      projectId: property.project_id ?? selectedProject?.id ?? null,
      propertyId: property.id,
    }),
    title: property.title,
    description: `${propertyTypeById.get(property.property_type_id)?.label_es ?? "Tipo sin etiqueta"} | ${
      LISTING_MODE_LABELS[property.listing_mode]
    }`,
    commercialStatusLabel: PROPERTY_STATUS_LABELS[property.commercial_status],
    isFeatured: property.is_featured,
  }));

  const selectedLeadData = selectedLead
    ? {
        id: selectedLead.id,
        fullName: selectedLead.full_name,
        phone: selectedLead.phone,
        email: selectedLead.email,
        currentStatusLabel: STATUS_LABELS[selectedLead.current_status],
        currentStatusValue: selectedLead.current_status,
        source: selectedLead.source,
        createdAt: selectedLead.created_at,
        meetingInterest: selectedLead.meeting_interest,
        sourcePath: selectedLead.source_path,
        message: selectedLead.message,
      }
    : null;

  const selectedLeadPropertyItems = selectedLeadProperties.map((property) => ({
    id: property.id,
    title: property.title,
    slug: property.slug,
    commercialStatusLabel: PROPERTY_STATUS_LABELS[property.commercial_status],
  }));

  const selectedLeadHistoryItems = selectedLeadHistory.map((historyItem) => ({
    id: historyItem.id,
    statusLabel: STATUS_LABELS[historyItem.status],
    note: historyItem.note,
    changedAt: historyItem.changed_at,
  }));

  const selectedProjectData = selectedProject
    ? {
        id: selectedProject.id,
        name: selectedProject.name,
        slug: selectedProject.slug,
        status: selectedProject.status,
        sortOrder: selectedProject.sort_order,
        whatsappPhone: selectedProject.whatsapp_phone,
        headline: selectedProject.headline,
        approximateLocationText: selectedProject.approximate_location_text,
        summary: selectedProject.summary,
        description: selectedProject.description,
        isFeatured: selectedProject.is_featured,
      }
    : null;

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
    <SitePage>
      <AdminHero
        currentProfileLabel={currentProfile.full_name ?? currentProfile.email ?? "broker_admin"}
        snapshot={snapshot}
      />

      <section className="section">
        <div className="admin-grid">
          <PipelinePanel pipeline={pipeline} />

          <Card className="admin-card admin-card--wide">
            <CardContent className="p-6">
              <div className="admin-leads-layout">
                <div className="admin-leads-list">
                  <div>
                    <p className="eyebrow">Leads</p>
                    <h2 className="section-title" style={{ fontSize: "2rem" }}>
                      Bandeja operativa
                    </h2>
                  </div>

                  <div className="admin-leads-list__items">
                    {leads.length === 0 ? (
                      <EmptyState eyebrow="Leads" description="Aun no hay leads registrados." />
                    ) : (
                      leads.map((lead) => {
                        const relatedProperty = (interestsByLeadId.get(lead.id) ?? [])
                          .map((interest) => propertyById.get(interest.property_id))
                          .find(Boolean);

                        return (
                          <SelectionLink
                            key={lead.id}
                            active={selectedLead?.id === lead.id}
                            href={adminHref({
                              leadId: lead.id,
                              projectId: currentProjectId,
                              propertyId: currentPropertyId,
                            })}
                            title={lead.full_name}
                            description={relatedProperty?.title ?? "Sin propiedad enlazada"}
                            meta={
                              <>
                                <Badge variant="metric">{STATUS_LABELS[lead.current_status]}</Badge>
                                <span className="muted">{formatLeadDate(lead.created_at)}</span>
                              </>
                            }
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="admin-lead-detail">
                  <LeadDetailPanel
                    currentProjectId={currentProjectId}
                    currentPropertyId={currentPropertyId}
                    selectedLead={selectedLeadData}
                    properties={selectedLeadPropertyItems}
                    history={selectedLeadHistoryItems}
                    statusOptions={leadStatusOptions}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-card admin-card--wide">
            <CardContent className="p-6">
              <div className="admin-inventory-layout">
                <ProjectEditor
                  createHref={adminHref({
                    leadId: selectedLead?.id ?? null,
                    projectId: "new",
                    propertyId: currentPropertyId,
                  })}
                  items={projectItems}
                  selectedLeadId={selectedLead?.id ?? null}
                  currentProjectId={currentProjectId}
                  currentPropertyId={currentPropertyId}
                  selectedProject={selectedProjectData}
                  statusOptions={projectStatusOptions}
                />

                <PropertyEditor
                  createHref={adminHref({
                    leadId: selectedLead?.id ?? null,
                    projectId: selectedProject?.id ?? null,
                    propertyId: "new",
                  })}
                  items={propertyItems}
                  selectedLeadId={selectedLead?.id ?? null}
                  currentProjectId={currentProjectId}
                  currentPropertyId={currentPropertyId}
                  selectedProjectId={selectedProject?.id ?? null}
                  selectedProperty={selectedPropertyData}
                  selectedPropertySummary={selectedPropertySummary}
                  projectOptions={projectOptions}
                  propertyTypeOptions={propertyTypeOptions}
                  listingModeOptions={listingModeOptions}
                  propertyStatusOptions={propertyStatusOptions}
                  priceModeOptions={priceModeOptions}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </SitePage>
  );
}
