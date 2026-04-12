"use client";

import Link from "next/link";
import { updateLeadStatus } from "@/app/admin/leads/actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, MessageSquare, ExternalLink, MapPin, History, CheckCircle2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type LeadStatusOption = {
  value: string;
  label: string;
};

type LeadPropertyItem = {
  id: string;
  title: string;
  slug: string;
  commercialStatusLabel: string;
};

type LeadHistoryItem = {
  id: string;
  statusLabel: string;
  note: string | null;
  changedAt: string;
};

type SelectedLead = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  currentStatusLabel: string;
  currentStatusValue: string;
  source: string;
  createdAt: string;
  meetingInterest: boolean;
  sourcePath: string | null;
  message: string | null;
};

type LeadDetailPanelProps = {
  currentProjectId: string | null;
  currentPropertyId: string | null;
  selectedLead: SelectedLead | null;
  properties: LeadPropertyItem[];
  history: LeadHistoryItem[];
  statusOptions: LeadStatusOption[];
};

function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export function LeadDetailPanel({
  currentProjectId,
  currentPropertyId,
  selectedLead,
  properties,
  history,
  statusOptions,
}: LeadDetailPanelProps) {
  if (!selectedLead) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-white/30 rounded-[32px] border border-dashed border-slate-200">
        <EmptyState
          eyebrow="Sin selección"
          description="Selecciona un cliente de la lista para ver su información detallada y gestionar su proceso."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PROFILE HEADER */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50/50 border-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {selectedLead.currentStatusLabel}
              </Badge>
              <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Origen: {selectedLead.source}
              </Badge>
              {selectedLead.meetingInterest && (
                <Badge variant="outline" className="bg-amber-50 border-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Solicitó Cita
                </Badge>
              )}
            </div>
            
            <h2 className="font-serif text-4xl tracking-tight text-slate-900 m-0 leading-tight">
              {selectedLead.fullName}
            </h2>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{selectedLead.phone}</span>
              </div>
              {selectedLead.email && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{selectedLead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Registrado: {formatLeadDate(selectedLead.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <form action={updateLeadStatus} className="space-y-3">
              <input name="leadId" type="hidden" value={selectedLead.id} />
              <input name="selectedLeadId" type="hidden" value={selectedLead.id} />
              <input name="selectedProjectId" type="hidden" value={currentProjectId ?? ""} />
              <input name="selectedPropertyId" type="hidden" value={currentPropertyId ?? ""} />
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Actualizar Estado</label>
                <select 
                  defaultValue={selectedLead.currentStatusValue} 
                  name="status"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all cursor-pointer"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-wider" type="submit">
                Guardar Cambios
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CONTEXT & MESSAGE */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-slate-400" />
            <h3 className="font-serif text-xl text-slate-900 m-0">Mensaje y Contexto</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
              "{selectedLead.message ?? "El interesado no dejó un mensaje adicional."}"
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              <span>Visto desde: <span className="font-medium text-slate-600">{selectedLead.sourcePath ?? "Sitio web (Home)"}</span></span>
            </div>
          </div>
        </div>

        {/* INTERESTED PROPERTY */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
            <h3 className="font-serif text-xl text-slate-900 m-0">Propiedad de Interés</h3>
          </div>
          
          <div className="space-y-4">
            {properties.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                Sin propiedad enlazada actualmente.
              </div>
            ) : (
              properties.map((property) => (
                <div key={property.id} className="group p-5 bg-[#0A0A0A] rounded-[24px] text-white flex items-center justify-between transition-transform hover:scale-[1.02]">
                  <div className="space-y-1">
                    <p className="font-serif text-lg m-0">{property.title}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{property.commercialStatusLabel}</p>
                  </div>
                  <Link 
                    href={`/propiedades/${property.slug}`} 
                    target="_blank"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ACTIVITY HISTORY */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.02)] space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="font-serif text-xl text-slate-900 m-0">Historial de Seguimiento</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{history.length} Eventos</span>
        </div>

        <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {history.length === 0 ? (
            <p className="text-slate-400 text-sm italic py-4">No hay cambios de estado registrados aún.</p>
          ) : (
            history.map((historyItem) => (
              <div key={historyItem.id} className="relative">
                <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-300 z-10" />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-900">{historyItem.statusLabel}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{formatLeadDate(historyItem.changedAt)}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {historyItem.note ?? "Cambio de estado realizado por el sistema."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
