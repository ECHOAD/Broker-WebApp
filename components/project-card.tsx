import Link from "next/link";
import { ArrowRight, MapPin, Briefcase } from "lucide-react";
import type { ProjectDetailData } from "@/lib/properties";
import { Badge } from "@/components/ui/badge";

type ProjectCardProps = {
  project: ProjectDetailData;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link 
      href={`/catalogo?project=${project.name}`}
      className="group relative block overflow-hidden rounded-[2.5rem] bg-slate-900 aspect-[4/5] shadow-2xl transition-all duration-700 hover:scale-[1.02]"
    >
      {/* Background Image */}
      {project.mainImageUrl ? (
        <img
          src={project.mainImageUrl}
          alt={project.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-80"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-80" />

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Proyecto Destacado
            </Badge>
            {project.location && (
              <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-medium">
                <MapPin className="w-3 h-3" />
                {project.location}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-3xl text-white m-0 leading-tight group-hover:text-accent transition-colors">
              {project.name}
            </h3>
            <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
              {project.headline || project.summary}
            </p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-white/10">
          <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-widest">
            <Briefcase className="w-3.5 h-3.5" />
            {project.propertyCount} Propiedades Disponibles
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white transition-all group-hover:bg-white group-hover:text-slate-900 group-hover:rotate-[-45deg]">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Logo Overlay (Subtle) */}
      {project.logoUrl && (
        <div className="absolute top-8 right-8 w-12 h-12">
          <img src={project.logoUrl} alt="Logo" className="w-full h-full object-contain filter brightness-0 invert opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </Link>
  );
}
