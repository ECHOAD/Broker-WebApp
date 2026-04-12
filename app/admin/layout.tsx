import { SitePage } from "@/components/layout/site-page";
import { AdminHero, PipelinePanel } from "@/components/admin/admin-primitives";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireBrokerAdmin } from "@/lib/auth";
import { computePipelineCounts, computeSnapshot } from "@/lib/admin";

export const dynamic = "force-dynamic";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { user, profile, supabase } = await requireBrokerAdmin();

  // Fetch datos para sidebar y hero
  const [
    { data: leadsData },
    { data: projectsData },
    { data: propertiesData },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id, current_status")
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, status")
      .order("sort_order", { ascending: true }),
    supabase
      .from("properties")
      .select("id, commercial_status")
      .order("created_at", { ascending: false }),
  ]);

  const leads = leadsData ?? [];
  const projects = projectsData ?? [];
  const properties = propertiesData ?? [];

  const pipeline = computePipelineCounts(leads);
  const snapshot = computeSnapshot(leads, properties, projects);

  return (
    <SitePage>
      <AdminHero
        currentProfileLabel={profile.full_name ?? profile.email ?? "broker_admin"}
        snapshot={snapshot}
      />

      <section className="section">
        <div className="admin-layout-wrapper">
          <aside className="admin-sidebar">
            <AdminNav />

            <div className="admin-sidebar-stats mt-8">
              <PipelinePanel pipeline={pipeline} />
            </div>
          </aside>

          <main className="admin-main-content">{children}</main>
        </div>
      </section>
    </SitePage>
  );
}
