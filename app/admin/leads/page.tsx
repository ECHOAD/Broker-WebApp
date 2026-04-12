import { Badge } from "@/components/ui/badge";
import { LeadDetailPanel } from "@/components/admin/lead-detail-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, LEAD_STATUS_OPTIONS, PROPERTY_STATUS_LABELS, formatLeadDate } from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Phone, Mail, Search, Filter } from "lucide-react";

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
    throw new Error("No pudimos leer la información de los clientes.");
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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Gestión Operativa</p>
          <h1 className="font-serif text-4xl tracking-tight text-slate-900 m-0">Clientes e Interesados</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Administra tus contactos, actualiza sus estados y realiza un seguimiento detallado de cada oportunidad.
          </p>
        </div>
        
        {/* Quick Search Placeholder (Functional UI) */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre..."
            className="w-full h-12 pl-11 pr-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all text-sm"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LIST COLUMN */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{leads.length} Contactos</span>
            <button className="text-slate-400 hover:text-slate-900 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-hide">
            {leads.length === 0 ? (
              <EmptyState eyebrow="Clientes" description="Aun no hay registros." />
            ) : (
              leads.map((lead) => {
                const relatedProperty = (interestsByLeadId.get(lead.id) ?? [])
                  .map((interest) => propertyById.get(interest.property_id))
                  .find(Boolean);
                
                const isActive = selectedLead?.id === lead.id;

                return (
                  <Link
                    key={lead.id}
                    href={`/admin/leads?lead=${lead.id}`}
                    className={cn(
                      "flex flex-col gap-3 p-5 rounded-[24px] border transition-all duration-300 group",
                      isActive 
                        ? "bg-white border-slate-200 shadow-[0_12px_30px_rgba(0,0,0,0.06)]" 
                        : "bg-transparent border-transparent hover:bg-white/50 hover:border-slate-100"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className={cn(
                          "font-serif text-lg leading-tight transition-colors",
                          isActive ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                        )}>
                          {lead.full_name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {relatedProperty?.title ?? "Sin propiedad específica"}
                        </p>
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap",
                        lead.current_status === 'new' ? "bg-blue-50 text-blue-600" :
                        lead.current_status === 'closed_won' ? "bg-emerald-50 text-emerald-600" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {STATUS_LABELS[lead.current_status]}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3" />
                        <span className="text-[10px] font-medium">{lead.phone}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-medium">{formatLeadDate(lead.created_at)}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </aside>

        {/* DETAIL COLUMN */}
        <main className="lg:col-span-8">
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <LeadDetailPanel
              currentProjectId={null}
              currentPropertyId={null}
              selectedLead={selectedLeadData}
              properties={selectedLeadPropertyItems}
              history={selectedLeadHistoryItems}
              statusOptions={LEAD_STATUS_OPTIONS}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
