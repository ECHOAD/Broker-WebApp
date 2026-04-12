"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageIntro } from "@/components/shared/page-intro";
import { PropertyCard } from "@/components/property-card";
import { MoneyInput } from "@/components/ui/money-input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { PropertyCardData } from "@/lib/properties";

type CatalogViewProps = {
  properties: PropertyCardData[];
};

function makeOptions(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function CatalogView({ properties }: CatalogViewProps) {
  const searchParams = useSearchParams();
  
  const defaultMinPrice = 0;
  const defaultMaxPrice = 20000000;

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState(defaultMinPrice);
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice);
  const [bedrooms, setBedrooms] = useState<string | null>(null);
  const [bathrooms, setBathrooms] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    const loc = searchParams.get("location");
    const type = searchParams.get("type");
    const proj = searchParams.get("project");
    const minP = searchParams.get("minPrice");
    const maxP = searchParams.get("maxPrice");

    if (loc) setSelectedLocation(loc);
    if (type) setSelectedPropertyType(type);
    if (proj) setSelectedProject(proj);
    if (minP) setMinPrice(parseInt(minP));
    if (maxP) setMaxPrice(parseInt(maxP));
  }, [searchParams]);

  const locations = useMemo(() => makeOptions(properties.map((property) => property.location)), [properties]);
  const modes = useMemo(() => makeOptions(properties.map((property) => property.listingMode)), [properties]);
  const projects = useMemo(() => makeOptions(properties.map((property) => property.project)), [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (selectedLocation && property.location !== selectedLocation) return false;
      if (selectedPropertyType && property.type !== selectedPropertyType) return false;
      if (selectedProject && property.project !== selectedProject) return false;
      if (selectedMode && property.listingMode !== selectedMode) return false;
      
      const price = property.priceAmount ?? 0;
      if (property.priceAmount !== null) {
        if (price < minPrice || price > maxPrice) return false;
      }
      
      if (bedrooms && bedrooms !== "Todos") {
        if (bedrooms === "5+") {
          if (property.bedrooms === null || property.bedrooms < 5) return false;
        } else {
          const bedroomCount = parseInt(bedrooms);
          if (property.bedrooms !== bedroomCount) return false;
        }
      }
      
      if (bathrooms && bathrooms !== "Todos") {
        if (bathrooms === "4+") {
          if (property.bathrooms === null || property.bathrooms < 4) return false;
        } else {
          const bathroomCount = parseInt(bathrooms);
          if (property.bathrooms !== bathroomCount) return false;
        }
      }
      
      return true;
    });
  }, [properties, selectedLocation, selectedMode, minPrice, maxPrice, bedrooms, bathrooms, selectedPropertyType, selectedProject]);

  const activeFilterCount = [selectedLocation, selectedMode, bedrooms, bathrooms, selectedPropertyType, selectedProject].filter(Boolean).length + (minPrice !== defaultMinPrice || maxPrice !== defaultMaxPrice ? 1 : 0);

  const formatInputValue = (value: number) => {
    return value.toLocaleString("en-US");
  };

  const handlePriceChange = (value: string, setter: (val: number) => void) => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, "")) || 0;
    setter(numericValue);
  };

  const resetFilters = () => {
    setSelectedLocation(null);
    setSelectedMode(null);
    setMinPrice(defaultMinPrice);
    setMaxPrice(defaultMaxPrice);
    setBedrooms(null);
    setBathrooms(null);
    setSelectedPropertyType(null);
    setSelectedProject(null);
  };

  return (
    <div className="catalog-page-grid">
      <aside className="catalog-sidebar sticky top-[7.5rem] self-start h-fit">
        <div className="catalog-sidebar__panel max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 scrollbar-hide">
          <div className="flex items-center justify-between mb-6">
            <p className="eyebrow m-0 opacity-50 text-[9px]">Refinar selección</p>
            {activeFilterCount > 0 && (
              <button 
                onClick={resetFilters}
                className="eyebrow m-0 text-primary border-b border-primary/20 pb-0.5 hover:border-primary transition-all lowercase italic text-[9px]"
              >
                Limpiar todo
              </button>
            )}
          </div>

          {/* Budget Range */}
          <section className="mb-8 px-1">
            <h2 className="font-serif text-[1.3rem] tracking-tight text-primary mb-6">Presupuesto</h2>
            <div className="grid gap-4">
              <MoneyInput 
                label="Mínimo (USD)"
                value={minPrice}
                onChange={setMinPrice}
              />
              <MoneyInput 
                label="Máximo (USD)"
                value={maxPrice}
                onChange={setMaxPrice}
              />
            </div>
          </section>

          {/* Spaces */}
          <section className="mb-8">
             <h2 className="font-serif text-[1.3rem] tracking-tight text-primary mb-6">Habitabilidad</h2>
             <div className="grid gap-6">
                <div>
                  <p className="eyebrow m-0 opacity-40 mb-3 tracking-[0.2em] text-[8px]">Habitaciones</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Todos", "1", "2", "3", "4", "5+"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={
                          (option === "Todos" && !bedrooms) || bedrooms === option
                            ? "py-2 rounded-full bg-primary text-white text-[10px] font-bold tracking-widest uppercase transition-all duration-300"
                            : "py-2 rounded-full border border-outline hover:border-primary/40 text-[10px] font-bold tracking-widest uppercase text-muted transition-all duration-200 bg-surface"
                        }
                        onClick={() => setBedrooms(option === "Todos" ? null : option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="eyebrow m-0 opacity-40 mb-3 tracking-[0.2em] text-[8px]">Baños</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Todos", "1", "2", "3", "4+"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={
                          (option === "Todos" && !bathrooms) || bathrooms === option
                            ? "py-2 rounded-full bg-primary text-white text-[10px] font-bold tracking-widest uppercase transition-all duration-300"
                            : "py-2 rounded-full border border-outline hover:border-primary/40 text-[10px] font-bold tracking-widest uppercase text-muted transition-all duration-200 bg-surface"
                        }
                        onClick={() => setBathrooms(option === "Todos" ? null : option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
          </section>

          {/* Mode */}
          <section className="mb-8">
            <h2 className="font-serif text-[1.3rem] tracking-tight text-primary mb-4">Operación</h2>
            <div className="flex flex-wrap gap-1.5">
              {['Venta', 'Venta / Renta', 'Renta'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={
                    selectedMode === option
                      ? 'px-4 py-2 rounded-full bg-primary text-white text-[9px] font-bold tracking-widest uppercase transition-all duration-300'
                      : 'px-4 py-2 rounded-full border border-outline text-[9px] font-bold tracking-widest uppercase text-muted hover:border-primary transition-all bg-surface'
                  }
                  onClick={() => setSelectedMode(selectedMode === option ? null : option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          {/* Property Type */}
          <section className="mb-8">
            <h2 className="font-serif text-[1.3rem] tracking-tight text-primary mb-6">Tipo de activo</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Villa', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=60' },
                { label: 'Apartamento', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=400&q=60' },
                { label: 'Terreno', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=60' },
                { label: 'Lote', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=60' },
              ].map((type) => (
                <div
                  key={type.label}
                  className={`relative group cursor-pointer overflow-hidden rounded-2xl aspect-[3/2] flex flex-col justify-end p-3 transition-all duration-500 border ${selectedPropertyType === type.label ? 'border-primary ring-2 ring-primary/5' : 'border-outline/20'}`}
                  onClick={() => setSelectedPropertyType(selectedPropertyType === type.label ? null : type.label)}
                >
                  <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 grayscale hover:grayscale-0" src={type.image} alt={type.label} />
                  <div className={`absolute inset-0 bg-gradient-to-t ${selectedPropertyType === type.label ? 'from-primary/90' : 'from-black/40'} to-transparent`} />
                  <div className="relative z-10">
                    <p className="text-white font-serif text-[0.8rem] tracking-wide m-0 italic">{type.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          {projects.length > 0 && (
            <section className="mb-8">
              <SearchableSelect
                label="Proyectos"
                value={selectedProject || ""}
                onChange={(val) => setSelectedProject(val || null)}
                options={projects.map(p => ({ value: p, label: p }))}
                placeholder="Todos los proyectos"
              />
            </section>
          )}

          {/* Location */}
          <section className="mb-8">
            <SearchableSelect
              label="Ubicación"
              value={selectedLocation || ""}
              onChange={(val) => setSelectedLocation(val || null)}
              options={locations.map(l => ({ value: l, label: l }))}
              placeholder="Todas las zonas"
            />
          </section>

          <div className="pt-6 border-t border-outline/20">
            <div className="flex items-center justify-between">
              <span className="eyebrow m-0 opacity-40 text-[8px]">{filteredProperties.length} Resultados</span>
              <button 
                onClick={resetFilters}
                className="eyebrow m-0 text-primary hover:opacity-70 transition-opacity lowercase italic text-[8px] border-b border-transparent hover:border-primary/30"
              >
                Resetear
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="catalog-main min-w-0">
        <section className="pt-6 pb-4">
          <div className="catalog-toolbar overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex gap-4">
              <div className="toolbar-group flex gap-3">
                <Badge variant="outline" className="px-5 py-2.5 border-outline/40 text-muted uppercase tracking-widest text-[10px] font-bold rounded-full">Cap Cana</Badge>
                <Badge variant="outline" className="px-5 py-2.5 border-outline/40 text-muted uppercase tracking-widest text-[10px] font-bold rounded-full">Las Terrenas</Badge>
                <Badge variant="outline" className="px-5 py-2.5 border-outline/40 text-muted uppercase tracking-widest text-[10px] font-bold rounded-full">Punta Cana</Badge>
              </div>
              <div className="h-4 w-px bg-outline/10 self-center" />
              <div className="toolbar-group flex gap-3">
                <Badge variant="outline" className="px-5 py-2.5 border-outline/40 text-muted uppercase tracking-widest text-[10px] font-bold rounded-full">Venta</Badge>
                <Badge variant="outline" className="px-5 py-2.5 border-outline/40 text-muted uppercase tracking-widest text-[10px] font-bold rounded-full">Destacados</Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-8">
          {filteredProperties.length === 0 ? (
            <EmptyState
              eyebrow="Inventario en preparación"
              description="Todavía no hay propiedades cargadas para este catálogo."
            />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-x-8 gap-y-10 w-full">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.slug} property={property} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
