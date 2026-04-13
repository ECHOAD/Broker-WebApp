import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectShowcase } from "@/components/projects/project-showcase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicProjectBySlug,
  getPublicProjectSlugs,
  listPublicPropertiesByProjectId,
} from "@/lib/properties";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;

const DEFAULT_PROJECT_DESCRIPTION =
  "Explora el proyecto, entiende su contexto y luego revisa las propiedades disponibles dentro de ese desarrollo.";
const DEFAULT_PROJECT_IMAGE = "/broker-photo-2.jpg";

function resolveProjectDescription(project: Awaited<ReturnType<typeof getPublicProjectBySlug>>) {
  if (!project) {
    return DEFAULT_PROJECT_DESCRIPTION;
  }

  return project.headline ?? project.summary ?? project.description ?? DEFAULT_PROJECT_DESCRIPTION;
}

export async function generateStaticParams() {
  const slugs = await getPublicProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) {
    return {
      title: "Proyecto | Carlos Realto",
      description: DEFAULT_PROJECT_DESCRIPTION,
    };
  }

  const title = `${project.name} | Carlos Realto`;
  const description = resolveProjectDescription(project);
  const projectUrl = `/proyectos/${project.slug}`;
  const shareImage = project.mainImageUrl ?? DEFAULT_PROJECT_IMAGE;

  return {
    title,
    description,
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      type: "website",
      locale: "es_DO",
      url: projectUrl,
      title,
      description,
      images: [
        {
          url: shareImage,
          alt: project.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const properties = await listPublicPropertiesByProjectId(project.id);

  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60rem] bg-[radial-gradient(circle_at_top_right,rgba(150,209,214,0.12),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(73,35,6,0.06),transparent_42%)]" />
        <ProjectShowcase project={project} properties={properties} />
      </main>
      <SiteFooter />
    </>
  );
}
