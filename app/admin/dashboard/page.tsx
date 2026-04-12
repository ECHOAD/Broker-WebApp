import { requireBrokerAdmin } from "@/lib/auth";
import { computeGroupedLeads, computeSnapshot, STATUS_LABELS } from "@/lib/admin";
import { formatLeadDate } from "@/lib/admin";
import { Users, Building2, Briefcase, TrendingUp, Clock, ChevronRight, Inbox, MessageSquare, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile, supabase } = await requireBrokerAdmin();

  const [
    { data: leadsData },
    { data: projectsData },
    { data: propertiesData },
  ] = await Promise.all([
    supabase.from("leads").select("id, current_status, full_name, created_at").order("created_at", { ascending: false }),
    supabase.from("projects").select("id, status").order("sort_order", { ascending: true }),
    supabase.from("properties").select("id, commercial_status").order("created_at", { ascending: false }),
  ]);

  const leads = leadsData ?? [];
  const projects = projectsData ?? [];
  const properties = propertiesData ?? [];

  const snapshot = computeSnapshot(leads, properties, projects);
  const groupedLeads = computeGroupedLeads(leads);
  const recentLeads = leads.slice(0, 5);

  const greeting = profile.full_name?.split(' ')[0] || "Administrador";

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <header className="flex items-end justify-between border-b border-slate-200 pb-8">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Resumen General</p>
          <h1 className="font-serif text-4xl tracking-tight text-slate-900 m-0">Hola, {greeting}.</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Aquí tienes una vista rápida del estado de tu inventario y el rendimiento de tus clientes.
          </p>
        </div>
      </header>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {snapshot.map((stat, i) => {
          const icons = [Users, Clock, Building2, Briefcase];
          const Icon = icons[i] || TrendingUp;
          return (
            <div 
              key={stat.label} 
              className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <p className="font-serif text-4xl tracking-tight text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl tracking-tight text-slate-900">Estado de tus Clientes</h2>
          <Link href="/admin/leads" className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
            Ir a la bandeja <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Por Atender */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_20px_40px_rgb(0,0,0,0.02)] flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white relative z-10 shadow-lg shadow-blue-200">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1 relative z-10">
              <h3 className="font-serif text-xl text-slate-900">Nuevos / Por Atender</h3>
              <p className="text-sm text-slate-500">Contactos que acaban de llegar y esperan respuesta.</p>
            </div>
            <div className="mt-auto pt-4 flex items-baseline gap-2 relative z-10">
              <span className="font-serif text-5xl text-blue-600">{groupedLeads.nuevos}</span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pendientes</span>
            </div>
          </div>

          {/* En Seguimiento */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_20px_40px_rgb(0,0,0,0.02)] flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white relative z-10 shadow-lg shadow-amber-200">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1 relative z-10">
              <h3 className="font-serif text-xl text-slate-900">En Conversación</h3>
              <p className="text-sm text-slate-500">Clientes en citas, negociando o interesados.</p>
            </div>
            <div className="mt-auto pt-4 flex items-baseline gap-2 relative z-10">
              <span className="font-serif text-5xl text-amber-600">{groupedLeads.seguimiento}</span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Activos</span>
            </div>
          </div>

          {/* Resultados */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_20px_40px_rgb(0,0,0,0.02)] flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white relative z-10 shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1 relative z-10">
              <h3 className="font-serif text-xl text-slate-900">Ciclos Cerrados</h3>
              <p className="text-sm text-slate-500">Total de clientes que ya terminaron su proceso.</p>
            </div>
            <div className="mt-auto pt-4 flex items-baseline gap-2 relative z-10">
              <span className="font-serif text-5xl text-emerald-600">{groupedLeads.finalizados}</span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-2xl tracking-tight text-slate-900 flex items-center gap-3">
            <Clock className="w-6 h-6 text-slate-400" />
            Últimos movimientos
          </h2>
          
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_40px_rgb(0,0,0,0.03)] overflow-hidden">
            {recentLeads.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {recentLeads.map((lead) => (
                  <Link 
                    key={lead.id} 
                    href={`/admin/leads?lead=${lead.id}`} 
                    className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-serif text-slate-500 group-hover:bg-white transition-colors">
                        {lead.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 m-0">{lead.full_name}</p>
                        <p className="text-xs text-slate-400 m-0">{formatLeadDate(lead.created_at)}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full",
                      lead.current_status === 'new' ? "bg-blue-50 text-blue-600" :
                      lead.current_status === 'closed_won' ? "bg-emerald-50 text-emerald-600" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      {STATUS_LABELS[lead.current_status]}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-sm italic text-slate-400">
                No hay actividad reciente.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-serif text-2xl tracking-tight text-slate-900 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-slate-400" />
            Inventario
          </h2>
          <div className="bg-[#0A0A0A] rounded-[32px] p-8 text-white space-y-8 relative overflow-hidden shadow-2xl shadow-slate-200">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mb-24 -mr-24 blur-3xl" />
            
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Propiedades</p>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl">{properties.length}</span>
                <span className="text-xs text-white/40">Cargadas</span>
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Proyectos</p>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl">{projects.length}</span>
                <span className="text-xs text-white/40">En desarrollo</span>
              </div>
            </div>

            <Button asChild className="w-full bg-white text-black hover:bg-slate-200 rounded-2xl h-12 relative z-10 border-none">
              <Link href="/admin/properties">Gestionar catálogo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
