import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { ProjectDetailData } from "@/lib/properties";

type ProjectDirectoryViewProps = {
  projects: ProjectDetailData[];
};

export function ProjectDirectoryView({ projects }: ProjectDirectoryViewProps) {
  return (
    <div className="grid gap-12 pb-20 pt-10">
      {/* Header Minimalista */}
      <section className="flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-primary/20" />
          <p className="eyebrow m-0 text-primary/40 uppercase tracking-[0.3em] text-[10px] font-bold">
            Exploración de desarrollos
          </p>
          <div className="h-[1px] w-8 bg-primary/20" />
        </div>
        
        <h1 className="m-0 font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.92] tracking-[-0.03em] text-primary italic">
          Proyectos.
        </h1>
        
        <p className="max-w-xl text-primary/60 text-[16px] leading-[1.6]">
          Selecciona un desarrollo para descubrir su concepto, ubicación y disponibilidad.
        </p>
      </section>

      {/* Grid de Proyectos */}
      <section>
        {projects.length === 0 ? (
          <EmptyState
            eyebrow="Directorio"
            title="Próximamente"
            description="Estamos preparando los lanzamientos exclusivos de esta temporada."
          />
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
