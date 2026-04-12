import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadDetailPanel } from "@/components/admin/lead-detail-panel";
import { SelectionLink } from "@/components/shared/selection-link";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, LEAD_STATUS_OPTIONS, PROPERTY_STATUS_LABELS, formatLeadDate } from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type LeadInterestRow = Database["public"]["Tables"]["lead_property_interests"]["Row"];
type LeadStatusHistoryRow = Database["public"]["Tables"]["lead_status_history"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

type LeadsPageProps = {
  searchParams: Promise<{
    lead?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const { lead: leadParam } = await searchParams;
  const supabase = await createClient();

  const [
    { data: leadsData, error: leadsError },
    { data: leadInterestsData, error: leadInterestsError },
    { data: leadHistoryData, error: leadHistoryError },
    { data: propertiesData, error: propertiesError },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id, full_name, phone, email, current_status, source, created_at, meeting_interest, source_path, message")
      .order("created_at", { ascending: false }),
    supabase
      .from("lead_property_interests")
      .select("id, lead_id, property_id, source_context, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("lead_status_history")
      .select("id, lead_id, status, note, changed_at")
      .order("changed_at", { ascending: false }),
    supabase
      .from("properties")
      .select("id, title, slug, commercial_status")
      .order("created_at", { ascending: false }),
  ]);

  if (leadsError || leadInterestsError || leadHistoryError || propertiesError) {
    throw new Error(
      leadsError?.message ??
        leadInterestsError?.message ??
        leadHistoryError?.message ??
        propertiesError?.message ??
        "No pudimos leer los leads.",
    );
  }

  const leads = (leadsData ?? []) as Array<
    Pick<LeadRow, "id" | "full_name" | "phone" | "email" | "current_status" | "source" | "created_at" | "meeting_interest" | "source_path" | "message">
  >;
  const leadInterests = (leadInterestsData ?? []) as Array<Pick<LeadInterestRow, "id" | "lead_id" | "property_id" | "source_context" | "created_at">>;
  const leadHistory = (leadHistoryData ?? []) as Array<Pick<LeadStatusHistoryRow, "id" | "lead_id" | "status" | "note" | "changed_at">>;
  const properties = (propertiesData ?? []) as Array<Pick<PropertyRow, "id" | "title" | "slug" | "commercial_status">>;

  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const interestsByLeadId = new Map<string, typeof leadInterests>();
  const historyByLeadId = new Map<string, typeof leadHistory>();

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

  const selectedLead = leads.find((lead) => lead.id === leadParam) ?? leads[0] ?? null;
  const selectedLeadInterests = selectedLead ? interestsByLeadId.get(selectedLead.id) ?? [] : [];
  const selectedLeadHistory = selectedLead ? historyByLeadId.get(selectedLead.id) ?? [] : [];
  const selectedLeadProperties = selectedLeadInterests
    .map((interest) => propertyById.get(interest.property_id))
    .filter((property): property is NonNullable<(typeof properties)[number]> => Boolean(property));

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

  return (
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
                      href={`/admin/leads?lead=${lead.id}`}
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
              currentProjectId={null}
              currentPropertyId={null}
              selectedLead={selectedLeadData}
              properties={selectedLeadPropertyItems}
              history={selectedLeadHistoryItems}
              statusOptions={LEAD_STATUS_OPTIONS}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
