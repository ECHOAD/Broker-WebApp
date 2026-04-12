import { requireBrokerAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireBrokerAdmin();

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans flex text-slate-900 selection:bg-slate-900 selection:text-white">
      <AdminSidebar />
      <main className="flex-1 ml-[280px] p-10 md:p-14 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
