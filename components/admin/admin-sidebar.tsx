"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Building2, Briefcase, LogOut, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Clientes", icon: Users },
  { href: "/admin/projects", label: "Proyectos", icon: Briefcase },
  { href: "/admin/properties", label: "Inmuebles", icon: Building2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0A0A0A] text-white flex flex-col border-r border-white/5">
      {/* Brand Header */}
      <div className="h-24 px-8 flex items-center border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Workspace</span>
          <Link href="/admin/dashboard" className="font-serif text-xl tracking-tight mt-1 flex items-center gap-2">
            Realto<span className="text-white/30 italic">Admin</span>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 px-4 flex flex-col gap-2">
        <span className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">Menú Principal</span>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
              )}
              <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Area */}
      <div className="p-6 border-t border-white/5 space-y-2">
        <Link 
          href="/" 
          className="flex items-center gap-3 text-white/60 hover:text-white transition-colors text-sm font-medium w-full px-2 py-2 group"
        >
          <Globe className="w-4 h-4 transition-transform group-hover:rotate-12 text-white/40 group-hover:text-white" />
          <span>Ver sitio público</span>
        </Link>
        
        <button className="flex items-center gap-3 text-white/40 hover:text-white transition-colors text-sm font-medium w-full px-2 py-2">
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
