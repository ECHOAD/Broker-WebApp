"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PropertyCardData } from "@/lib/properties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FeaturedOpportunitiesSliderProps = {
  properties: PropertyCardData[];
};

function buildVisualStyle(imageUrl: string | null, anchor = "center"): CSSProperties {
  return imageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(27, 28, 25, 0.04), rgba(27, 28, 25, 0.44)), url("${imageUrl}")`,
        backgroundPosition: anchor,
        backgroundSize: "cover",
      }
    : {
        background:
          "linear-gradient(135deg, rgba(0, 51, 54, 0.96) 0%, rgba(0, 75, 80, 0.82) 65%, rgba(73, 35, 6, 0.52) 100%)",
      };
}

export function FeaturedOpportunitiesSlider({
  properties,
}: FeaturedOpportunitiesSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (properties.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % properties.length);
    }, 4800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [properties.length]);

  if (properties.length === 0) {
    return null;
  }

  const activeProperty = properties[activeIndex];

  return (
    <div className="grid gap-5">
      <div className="overflow-hidden rounded-[2.4rem] bg-[color:var(--surface-soft)] shadow-[0_24px_70px_rgba(27,28,25,0.06)]">
        <div
          className="flex will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {properties.map((property, index) => (
            <article
              key={property.id}
              className="grid w-full shrink-0 basis-full gap-6 p-4 md:p-5 lg:grid-cols-[1.04fr_0.96fr] lg:items-center"
            >
              <div
                className="relative min-h-[22rem] overflow-hidden rounded-[2rem] bg-[color:var(--surface-deep)] md:min-h-[33rem]"
                style={buildVisualStyle(property.coverImageUrl, index % 2 === 0 ? "center" : "center top")}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,28,25,0.02)_0%,rgba(27,28,25,0.14)_44%,rgba(27,28,25,0.52)_100%)]" />
                <div className="absolute left-5 top-5">
                  <Badge variant="inverse">{property.badge}</Badge>
                </div>
                <div className="absolute inset-x-5 bottom-5 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-white/18 bg-white/10 text-white/86">
                    {property.location}
                  </Badge>
                  <Badge variant="outline" className="border-white/18 bg-white/10 text-white/86">
                    {property.area}
                  </Badge>
                </div>
              </div>

              <div className="rounded-[2rem] bg-[color:var(--surface)] p-7 shadow-[0_20px_60px_rgba(27,28,25,0.05)] lg:p-9">
                <p className="eyebrow m-0">{property.project}</p>
                <h2 className="mt-3 mb-0 font-serif text-[clamp(1.8rem,3vw,2.7rem)] leading-[0.98] tracking-[-0.035em]">
                  {property.title}
                </h2>
                <p className="mt-5 mb-0 text-base leading-8 text-muted">{property.pitch}</p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Badge variant="chip">{property.type}</Badge>
                  <Badge variant="chip">{property.listingMode}</Badge>
                  <Badge variant="chip">{property.status}</Badge>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="eyebrow m-0">Precio</p>
                    <p className="mt-2 mb-0 font-serif text-[1.65rem] leading-none tracking-[-0.03em] text-primary">
                      {property.priceLabel}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow m-0">Lectura rápida</p>
                    <p className="mt-2 mb-0 text-sm leading-7 text-muted">{property.area}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href={`/propiedades/${property.slug}`}>Ver detalle completo</Link>
                  </Button>
                  <Button asChild size="lg" variant="tertiary">
                    <Link href="/catalogo">Abrir catálogo</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          {properties.map((property, index) => (
            <button
              key={property.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group rounded-[1.4rem] px-4 py-3 text-left transition-all duration-300 ${
                activeIndex === index
                  ? "bg-[color:var(--surface)] shadow-[0_16px_40px_rgba(27,28,25,0.05)]"
                  : "bg-[color:var(--surface-soft)] hover:bg-[color:var(--surface)]"
              }`}
              aria-label={`Ir a ${property.title}`}
            >
              <p className="eyebrow m-0">{property.project}</p>
              <p className="mt-2 font-serif text-[1rem] leading-tight tracking-[-0.02em] text-foreground">
                {property.title}
              </p>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {properties.map((property, index) => (
              <button
                key={property.slug}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Mostrar slide ${index + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index ? "w-8 bg-primary" : "w-2.5 bg-primary/20"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline bg-[color:var(--surface)] text-primary transition-transform duration-200 hover:-translate-y-px"
              onClick={() =>
                setActiveIndex((currentIndex) =>
                  currentIndex === 0 ? properties.length - 1 : currentIndex - 1,
                )
              }
              aria-label="Slide anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline bg-[color:var(--surface)] text-primary transition-transform duration-200 hover:-translate-y-px"
              onClick={() => setActiveIndex((currentIndex) => (currentIndex + 1) % properties.length)}
              aria-label="Slide siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>



      <div className="sr-only" aria-live="polite">
        Mostrando {activeProperty.title}
      </div>
    </div>
  );
}
