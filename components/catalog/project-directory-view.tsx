import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectDetailData } from "@/lib/properties";

type ProjectDirectoryViewProps = {
  projects: ProjectDetailData[];
};

export function ProjectDirectoryView({ projects }: ProjectDirectoryViewProps) {
  const totalProperties = projects.reduce((sum, project) => sum + project.propertyCount, 0);
  const locations = [...new Set(projects.map((project) => project.location).filter(Boolean))];

  return (
    <div className="grid gap-14 pb-16 pt-6">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#003336] via-[#00474b] to-[#002729] px-8 py-10 text-white lg:px-12 lg:py-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 right-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(225,162,124,0.22),transparent_70%)] blur-3xl" />
          <div className="absolute bottom-[-18%] left-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(150,209,214,0.18),transparent_70%)] blur-3xl" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="grid gap-6">
            <div className="grid gap-4">
              <p className="eyebrow m-0 text-white/60">Exploración guiada</p>
              <h1 className="m-0 font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[0.94] tracking-[-0.04em] text-balance">
                Primero eliges el proyecto. Después descubres sus propiedades.
              </h1>
              <p className="max-w-2xl text-white/78 text-[1.02rem] leading-8">
                La oferta está organizada por desarrollos, no como unidades aisladas. Así entiendes mejor la ubicación,
                el carácter del proyecto y el inventario disponible antes de entrar al detalle de cada propiedad.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                1. Elige un proyecto
              </Badge>
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                2. Revisa disponibilidad
              </Badge>
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                3. Entra a la propiedad correcta
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/12 bg-white/10 p-6 backdrop-blur-md">
            <div className="grid gap-1">
              <p className="eyebrow m-0 text-white/55">Panorama actual</p>
              <p className="m-0 font-serif text-3xl tracking-[-0.04em]">{projects.length} proyectos publicados</p>
            </div>

            <div className="grid gap-3 text-white/78">
              <div className="flex items-center justify-between gap-4 rounded-[1.4rem] bg-black/10 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4" />
                  Inventario navegable
                </span>
                <strong className="font-serif text-lg text-white">{totalProperties}</strong>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-[1.4rem] bg-black/10 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  Zonas activas
                </span>
                <strong className="font-serif text-lg text-white">{locations.length}</strong>
              </div>
            </div>

            <Button asChild variant="secondary" size="lg" className="w-full justify-center">
              <Link href="/#proyectos-destacados" className="inline-flex items-center gap-2">
                Ver destacados del home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-2">
            <p className="eyebrow m-0 text-primary/60">Directorio de proyectos</p>
            <h2 className="m-0 font-serif text-[clamp(2rem,4vw,3.3rem)] leading-[0.96] tracking-[-0.04em]">
              Selecciona el desarrollo que quieres explorar
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Cada proyecto abre su propia página con narrativa, ubicación y las propiedades disponibles dentro de ese contexto.
          </p>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            eyebrow="Directorio en preparación"
            title="Aún no hay proyectos publicados"
            description="Cuando el inventario esté listo, el catálogo público comenzará por aquí."
          />
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
