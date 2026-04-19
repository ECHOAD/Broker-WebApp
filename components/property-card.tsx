"use client";

import Link from "next/link";
import Image from "next/image";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { Badge } from "@/components/ui/badge";
import { PropertyCardData } from "@/lib/properties";
import { BedDouble, Bath, Maximize, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PropertyCardProps = {
  property: PropertyCardData;
  navigationMode?: "direct" | "project";
};

export function PropertyCard({ property, navigationMode = "direct" }: PropertyCardProps) {
  const shouldRouteThroughProject = navigationMode === "project" && property.projectSlug;
  const primaryHref = shouldRouteThroughProject
    ? `/proyectos/${property.projectSlug}`
    : `/propiedades/${property.slug}`;

  // Extraer número de área para mostrarlo más limpio si es posible
  const displayArea = property.area.split('·')[0].trim();

  return (
    <div className="group relative">
      <Link 
        href={primaryHref}
        className="block bg-white rounded-[2.5rem] overflow-hidden border border-primary/5 shadow-sm hover:shadow-2xl transition-all duration-700 hover:scale-[1.01]"
      >
        {/* Visual: Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
          {property.coverImageUrl ? (
            <Image
              src={property.coverImageUrl}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-primary/10">
              <Maximize size={48} strokeWidth={1} />
            </div>
          )}
          
          {/* Status Badges Overlay */}
          <div className="absolute top-6 left-6 flex flex-wrap gap-2">
            <Badge variant="chip" className="bg-white/80 backdrop-blur-md border-none text-[9px] font-bold text-primary uppercase tracking-widest">
              {property.status}
            </Badge>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>

        {/* Content Body */}
        <div className="p-8 lg:p-10 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="eyebrow text-[9px] text-primary/30 font-bold uppercase tracking-[0.2em]">
                {property.project}
              </span>
              <div className="h-[1px] w-4 bg-primary/10" />
              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">
                {property.type}
              </span>
            </div>
            
            <h3 className="font-serif text-[1.8rem] leading-[1.1] text-primary tracking-tight italic group-hover:text-accent transition-colors duration-500">
              {property.title}
            </h3>
          </div>

          {/* Key Metrics */}
          <div className="flex items-center gap-6 pt-2">
            {property.bedrooms && (
              <div className="flex items-center gap-2 text-primary/40">
                <BedDouble size={16} strokeWidth={1.5} />
                <span className="text-xs font-bold">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-2 text-primary/40">
                <Bath size={16} strokeWidth={1.5} />
                <span className="text-xs font-bold">{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-primary/40">
              <Maximize size={15} strokeWidth={1.5} />
              <span className="text-xs font-bold">{displayArea}</span>
            </div>
          </div>

          {/* Footer: Price & Action */}
          <div className="flex items-end justify-between pt-6 border-t border-primary/5">
            <div className="space-y-1">
              <p className="eyebrow text-[9px] text-primary/25 font-bold uppercase tracking-widest">Valor de mercado</p>
              <p className="text-[1.4rem] font-serif italic text-primary leading-none">
                {property.priceLabel}
              </p>
            </div>
            
            <div className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center text-primary/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 group-hover:rotate-[-45deg]">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </Link>

      {/* Floating Favorite Toggle (Independent of Link) */}
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-white/40 backdrop-blur-md rounded-full p-1 border border-white/20 hover:bg-white transition-all duration-300 shadow-sm">
          <FavoriteToggle propertyId={property.id} />
        </div>
      </div>
    </div>
  );
}
