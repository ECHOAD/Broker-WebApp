import { Card, CardContent } from "@/components/ui/card";
import { ProjectEditor } from "@/components/admin/project-editor";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_OPTIONS } from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

type ProjectsPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { project: projectParam } = await searchParams;
  const supabase = await createClient();

  const [{ data: projectsData, error: projectsError }, { data: propertiesData, error: propertiesError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, name, slug, status, is_featured, headline, summary, description, approximate_location_text, whatsapp_phone, sort_order, created_at, published_at",
        )
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase.from("properties").select("id, project_id").order("created_at", { ascending: false }),
    ]);

  if (projectsError || propertiesError) {
    throw new Error(projectsError?.message ?? propertiesError?.message ?? "No pudimos leer los proyectos.");
  }

  const projects = (projectsData ?? []) as Array<
    Pick<
      ProjectRow,
      | "id"
      | "name"
      | "slug"
      | "status"
      | "is_featured"
      | "headline"
      | "summary"
      | "description"
      | "approximate_location_text"
      | "whatsapp_phone"
      | "sort_order"
      | "created_at"
      | "published_at"
    >
  >;
  const properties = (propertiesData ?? []) as Array<Pick<PropertyRow, "id" | "project_id">>;

  const propertiesByProjectId = new Map<string, typeof properties>();
  for (const property of properties) {
    if (!property.project_id) continue;
    const bucket = propertiesByProjectId.get(property.project_id) ?? [];
    bucket.push(property);
    propertiesByProjectId.set(property.project_id, bucket);
  }

  const selectedProject =
    projectParam && projectParam !== "new" ? projects.find((project) => project.id === projectParam) ?? null : null;

  const projectItems = projects.map((project) => ({
    id: project.id,
    active: selectedProject?.id === project.id,
    href: `/admin/projects?project=${project.id}`,
    name: project.name,
    headline: project.headline,
    statusLabel: PROJECT_STATUS_LABELS[project.status],
    isFeatured: project.is_featured,
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
        logoStoragePath: null,
      }
    : null;

  return (
    <Card className="admin-card admin-card--wide">
      <CardContent className="p-6">
        <ProjectEditor
          createHref="/admin/projects?project=new"
          items={projectItems}
          selectedLeadId={null}
          currentProjectId={selectedProject?.id ?? (projectParam === "new" ? "new" : null)}
          currentPropertyId={null}
          selectedProject={selectedProjectData}
          statusOptions={PROJECT_STATUS_OPTIONS}
        />
      </CardContent>
    </Card>
  );
}
