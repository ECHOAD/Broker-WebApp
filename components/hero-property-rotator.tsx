"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { PropertyCardData } from "@/lib/properties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type HeroPropertyRotatorProps = {
  properties: PropertyCardData[];
};

function buildVisualStyle(imageUrl: string | null, anchor = "center"): CSSProperties {
  return imageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(27, 28, 25, 0.08), rgba(27, 28, 25, 0.5)), url("${imageUrl}")`,
        backgroundPosition: anchor,
        backgroundSize: "cover",
      }
    : {
        background:
          "linear-gradient(135deg, rgba(0, 51, 54, 0.96) 0%, rgba(0, 75, 80, 0.82) 65%, rgba(73, 35, 6, 0.52) 100%)",
      };
}

export function HeroPropertyRotator({ properties }: HeroPropertyRotatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (properties.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % properties.length);
    }, 5600);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [properties.length]);

  if (properties.length === 0) {
    return null;
  }

  const activeProperty = properties[activeIndex];
  const activePropertyHref = activeProperty.projectSlug
    ? `/proyectos/${activeProperty.projectSlug}`
    : `/propiedades/${activeProperty.slug}`;
  const activePropertyLabel = activeProperty.projectSlug ? "Entrar al proyecto" : "Ver oportunidad destacada";

  return (
    <div className="relative min-h-[38rem] overflow-hidden rounded-[2.3rem] bg-[color:var(--surface-container-lowest)] shadow-[0_28px_70px_rgba(27,28,25,0.08)]">
      {properties.map((property, index) => (
        <div
          key={property.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            activeIndex === index ? "opacity-100" : "opacity-0"
          }`}
          style={buildVisualStyle(property.coverImageUrl ?? "/property-placeholder.jpg", "center")}
          aria-hidden={activeIndex !== index}
        />
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,18,19,0.08)_0%,rgba(9,18,19,0.16)_34%,rgba(9,18,19,0.68)_100%)]" />

      <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
        <div className="flex items-start">
          <Badge variant="inverse">{activeProperty.badge}</Badge>
        </div>

        <div className="grid gap-4">
          <div className="max-w-[33rem] rounded-[2rem] border border-white/18 bg-[rgba(251,249,244,0.14)] p-6 text-white backdrop-blur-xl">
            <p className="eyebrow m-0 text-white/70">{activeProperty.project}</p>
            <h2 className="mt-3 mb-0 font-serif text-[clamp(1.75rem,3vw,2.8rem)] leading-[0.98] tracking-[-0.035em]">
              {activeProperty.title}
            </h2>
            <p className="mt-4 mb-0 max-w-[28rem] text-[0.98rem] leading-7 text-white/82">
              {activeProperty.pitch}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Badge variant="outline" className="border-white/22 bg-white/8 text-white/82">
                {activeProperty.type}
              </Badge>
              <Badge variant="outline" className="border-white/22 bg-white/8 text-white/82">
                {activeProperty.listingMode}
              </Badge>
              <span className="font-serif text-[1.2rem]">{activeProperty.priceLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="inverse" size="lg">
                <Link href={activePropertyHref}>{activePropertyLabel}</Link>
              </Button>
              <p className="m-0 text-sm leading-6 text-white/72">
                La exploración parte del proyecto para que entiendas mejor el contexto antes de elegir una unidad.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end">
              {properties.map((property, index) => (
                <button
                  key={property.slug}
                  type="button"
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/35"
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Mostrar ${property.title}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        Mostrando {activeProperty.title}
      </div>
    </div>
  );
}
