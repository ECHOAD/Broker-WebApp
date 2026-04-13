import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SitePage } from "@/components/layout/site-page";
import { ProjectDirectoryView } from "@/components/catalog/project-directory-view";
import {
  getPublicProjectBySlugOrName,
  listPublicProjectsDetailed,
} from "@/lib/properties";

export const revalidate = 300;

type CatalogoPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

const CATALOG_TITLE = "Catálogo de Proyectos | Carlos Realto";
const CATALOG_DESCRIPTION =
  "Explora primero los proyectos inmobiliarios y, desde cada desarrollo, entra a las propiedades disponibles.";

export async function generateMetadata({ searchParams }: CatalogoPageProps): Promise<Metadata> {
  const { project: projectQuery } = await searchParams;

  if (projectQuery) {
    const project = await getPublicProjectBySlugOrName(projectQuery);

    if (project) {
      return {
        title: `${project.name} | Proyectos | Carlos Realto`,
        description:
          project.headline ?? project.summary ?? project.description ?? CATALOG_DESCRIPTION,
        alternates: {
          canonical: `/proyectos/${project.slug}`,
        },
      };
    }
  }

  return {
    title: CATALOG_TITLE,
    description: CATALOG_DESCRIPTION,
    alternates: {
      canonical: "/catalogo",
    },
  };
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const { project: projectQuery } = await searchParams;

  if (projectQuery) {
    const project = await getPublicProjectBySlugOrName(projectQuery);

    if (project) {
      redirect(`/proyectos/${project.slug}`);
    }
  }

  const projects = await listPublicProjectsDetailed();

  return (
    <SitePage>
      <ProjectDirectoryView projects={projects} />
    </SitePage>
  );
}
