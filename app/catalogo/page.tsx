import type { Metadata } from "next";
import { Suspense } from "react";
import { SitePage } from "@/components/layout/site-page";
import { CatalogView } from "@/components/catalog/catalog-view";
import { getPublicProjectBySlugOrName, listPublicProperties } from "@/lib/properties";

export const revalidate = 300;

type CatalogoPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

const CATALOG_TITLE = "Catálogo | Carlos Realto";
const CATALOG_DESCRIPTION =
  "Explora propiedades, proyectos y oportunidades inmobiliarias premium en República Dominicana.";
const DEFAULT_SHARE_IMAGE = "/broker-photo-2.jpg";

function resolveProjectDescription(project: {
  headline: string | null;
  summary: string | null;
  description: string | null;
}) {
  return (
    project.headline ??
    project.summary ??
    project.description ??
    CATALOG_DESCRIPTION
  );
}

export async function generateMetadata({ searchParams }: CatalogoPageProps): Promise<Metadata> {
  const { project: projectQuery } = await searchParams;

  if (!projectQuery) {
    return {
      title: CATALOG_TITLE,
      description: CATALOG_DESCRIPTION,
      alternates: {
        canonical: "/catalogo",
      },
    };
  }

  const project = await getPublicProjectBySlugOrName(projectQuery);

  if (!project) {
    return {
      title: CATALOG_TITLE,
      description: CATALOG_DESCRIPTION,
      alternates: {
        canonical: "/catalogo",
      },
    };
  }

  const title = `${project.name} | Proyectos | Carlos Realto`;
  const description = resolveProjectDescription(project);
  const canonicalUrl = `/catalogo?project=${encodeURIComponent(project.slug)}`;
  const shareImage = project.mainImageUrl ?? DEFAULT_SHARE_IMAGE;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "es_DO",
      url: canonicalUrl,
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

export default async function CatalogoPage() {
  const properties = await listPublicProperties();

  return (
    <SitePage>
      <Suspense fallback={<div className="py-20 text-center font-serif italic text-muted">Cargando catálogo...</div>}>
        <CatalogView properties={properties} />
      </Suspense>
    </SitePage>
  );
}
