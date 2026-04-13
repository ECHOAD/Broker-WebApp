import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, MapPin, MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PropertyCard } from "@/components/property-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/contact";
import type { ProjectDetailData, PropertyCardData } from "@/lib/properties";

type ProjectShowcaseProps = {
  project: ProjectDetailData;
  properties: PropertyCardData[];
};

function resolveProjectNarrative(project: ProjectDetailData) {
  return (
    project.description ??
    project.summary ??
    "Explora el inventario disponible dentro de este proyecto y luego entra a la propiedad que mejor encaja con tu criterio."
  );
}

export function ProjectShowcase({ project, properties }: ProjectShowcaseProps) {
  const brokerWhatsApp = buildWhatsAppUrl(
    `Hola Carlos, quiero conocer las propiedades disponibles en ${project.name}.`,
  );

  return (
    <div className="page-shell grid gap-16 pb-20 pt-8 lg:gap-20">
      <section className="grid gap-8">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 eyebrow text-primary/60 transition-colors hover:text-primary"
        >
          <ArrowLeft size={14} />
          Volver al catálogo de proyectos
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
          <div className="grid gap-6">
            <div className="flex flex-wrap gap-3">
              <Badge variant="chip">Proyecto</Badge>
              {project.location ? (
                <Badge variant="metric" className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {project.location}
                </Badge>
              ) : null}
              <Badge variant="metric" className="inline-flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                {properties.length} propiedades disponibles
              </Badge>
            </div>

            <div className="grid gap-4">
              <p className="eyebrow m-0 text-primary/60">{project.headline ?? "Exploración por proyecto"}</p>
              <h1 className="m-0 font-serif text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.05em] text-balance">
                {project.name}
              </h1>
              <p className="max-w-3xl text-[1.02rem] leading-8 text-muted">{resolveProjectNarrative(project)}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8">
                <a href="#propiedades" className="inline-flex items-center gap-2">
                  Ver propiedades del proyecto
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              {brokerWhatsApp ? (
                <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
                  <a
                    href={brokerWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Consultar este proyecto
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-deep shadow-[0_28px_70px_rgba(27,28,25,0.12)]">
            {project.mainImageUrl ? (
              <img
                src={project.mainImageUrl}
                alt={project.name}
                className="aspect-[4/5] w-full object-cover lg:aspect-[5/4]"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-[linear-gradient(135deg,rgba(0,51,54,0.96),rgba(0,75,80,0.82),rgba(73,35,6,0.58))] lg:aspect-[5/4]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            {project.logoUrl ? (
              <div className="absolute right-6 top-6 h-14 w-14 rounded-2xl bg-white/12 p-3 backdrop-blur-md">
                <img src={project.logoUrl} alt={`${project.name} logo`} className="h-full w-full object-contain" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section id="propiedades" className="grid gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-2">
            <p className="eyebrow m-0 text-primary/60">Inventario del proyecto</p>
            <h2 className="m-0 font-serif text-[clamp(2rem,4vw,3.3rem)] leading-[0.96] tracking-[-0.04em]">
              Elige la propiedad que quieres revisar
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Aquí ya estás dentro del contexto correcto. Desde esta selección sí entras al detalle de cada unidad.
          </p>
        </div>

        {properties.length === 0 ? (
          <EmptyState
            eyebrow="Inventario en preparación"
            title="Este proyecto aún no tiene propiedades públicas"
            description="El proyecto ya está publicado, pero las unidades todavía no se han liberado en el catálogo."
          />
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
