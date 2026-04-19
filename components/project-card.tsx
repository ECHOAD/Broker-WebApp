import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { ProjectDetailData } from "@/lib/properties";

type ProjectCardProps = {
  project: ProjectDetailData;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link 
      href={`/proyectos/${project.slug}`}
      className="group relative block overflow-hidden rounded-[2rem] aspect-[4/5] bg-surface-soft shadow-sm transition-all duration-700 hover:scale-[1.01] hover:shadow-2xl"
    >
      {/* Background Image */}
      {project.mainImageUrl ? (
        <img
          src={project.mainImageUrl}
          alt={project.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-primary/5" />
      )}

      {/* Elegant Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="space-y-4">
          <div className="space-y-2">
            {project.location && (
              <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                <MapPin className="w-3 h-3 text-accent" />
                {project.location}
              </div>
            )}
            
            <h3 className="font-serif text-3xl text-white m-0 leading-[1.1] tracking-tight group-hover:text-accent transition-colors duration-500 italic">
              {project.name}
            </h3>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-[10px] text-white/60 font-bold uppercase tracking-[0.1em]">
              {project.propertyCount} Unidades
            </span>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white transition-all duration-500 group-hover:bg-white group-hover:text-primary group-hover:border-white">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Logo Overlay (Subtle) */}
      {project.logoUrl && (
        <div className="absolute top-8 right-8 w-10 h-10">
          <img 
            src={project.logoUrl} 
            alt="" 
            className="w-full h-full object-contain filter brightness-0 invert opacity-30 group-hover:opacity-100 transition-opacity duration-700" 
          />
        </div>
      )}
    </Link>
  );
}
