"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageIntro } from "@/components/shared/page-intro";
import { PropertyCard } from "@/components/property-card";
import type { PropertyCardData } from "@/lib/properties";

type CatalogViewProps = {
  properties: PropertyCardData[];
};

function makeOptions(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function CatalogView({ properties }: CatalogViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState(500000);
  const [maxPrice, setMaxPrice] = useState(15000000);
  const [bedrooms, setBedrooms] = useState<string | null>(null);
  const [bathrooms, setBathrooms] = useState<string | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);

  const locations = useMemo(() => makeOptions(properties.map((property) => property.location)), [properties]);
  const modes = useMemo(() => makeOptions(properties.map((property) => property.listingMode)), [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Location filter
      if (selectedLocation && property.location !== selectedLocation) return false;
      
      // Property type filter (from cards)
      if (selectedPropertyType && property.type !== selectedPropertyType) return false;
      
      // Mode filter
      if (selectedMode && property.listingMode !== selectedMode) return false;
      
      // Price range filter
      if (property.priceAmount !== null && (property.priceAmount < minPrice || property.priceAmount > maxPrice)) return false;
      
      // Bedrooms filter
      if (bedrooms && bedrooms !== "Cualquiera") {
        if (bedrooms === "5+") {
          if (property.bedrooms === null || property.bedrooms < 5) return false;
        } else {
          const bedroomCount = parseInt(bedrooms);
          if (property.bedrooms !== bedroomCount) return false;
        }
      }
      
      // Bathrooms filter
      if (bathrooms && bathrooms !== "Cualquiera") {
        if (bathrooms === "4+") {
          if (property.bathrooms === null || property.bathrooms < 4) return false;
        } else {
          const bathroomCount = parseInt(bathrooms);
          if (property.bathrooms !== bathroomCount) return false;
        }
      }
      
      return true;
    });
  }, [properties, selectedLocation, selectedMode, minPrice, maxPrice, bedrooms, bathrooms, selectedPropertyType]);

  const activeFilterCount = [selectedLocation, selectedMode, bedrooms, bathrooms, selectedPropertyType].filter(Boolean).length + (minPrice !== 500000 || maxPrice !== 15000000 ? 1 : 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="catalog-page-grid">
      <aside className="catalog-sidebar">
        <div className="catalog-sidebar__panel">
          <p className="eyebrow">Refinar Búsqueda</p>

          {/* Budget Range */}
          <section className="catalog-sidebar__section">
            <h2 className="font-headline text-2xl mb-8 text-primary">Rango de Presupuesto</h2>
            <div className="relative pt-1">
              <div className="flex justify-between mb-4">
                <span className="text-label-md font-medium text-on-surface-variant tracking-wider uppercase">US$ 500k</span>
                <span className="text-label-md font-medium text-on-surface-variant tracking-wider uppercase">US$ 20M+</span>
              </div>
              {/* Functional Price Range Slider */}
              <div className="relative">
                <input
                  type="range"
                  min="500000"
                  max="20000000"
                  step="50000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.min(parseInt(e.target.value), maxPrice - 100000))}
                  className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer slider-thumb"
                  style={{ zIndex: 3 }}
                />
                <input
                  type="range"
                  min="500000"
                  max="20000000"
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.max(parseInt(e.target.value), minPrice + 100000))}
                  className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer slider-thumb"
                  style={{ zIndex: 4 }}
                />
                <div className="h-1 bg-surface-container-highest rounded-full w-full relative">
                  <div 
                    className="absolute h-1 bg-primary rounded-full" 
                    style={{ 
                      left: `${((minPrice - 500000) / (20000000 - 500000)) * 100}%`, 
                      right: `${100 - ((maxPrice - 500000) / (20000000 - 500000)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] text-on-surface-variant font-semibold tracking-widest uppercase mb-1">Mínimo</p>
                <p className="font-headline text-lg">{formatCurrency(minPrice)}</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] text-on-surface-variant font-semibold tracking-widest uppercase mb-1">Máximo</p>
                <p className="font-headline text-lg">{formatCurrency(maxPrice)}</p>
              </div>
            </div>
          </section>

          {/* Accommodations */}
          <section className="catalog-sidebar__section">
            <div className="mb-8">
              <h2 className="font-headline text-2xl mb-6 text-primary">Habitaciones</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {["Cualquiera", "1", "2", "3", "4", "5+"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      bedrooms === option
                        ? "flex-none px-6 py-3 rounded-full bg-primary text-on-primary text-sm font-medium shadow-md"
                        : "flex-none px-6 py-3 rounded-full border border-outline-variant hover:border-primary text-sm font-medium transition-all"
                    }
                    onClick={() => setBedrooms(bedrooms === option ? null : option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-headline text-2xl mb-6 text-primary">Baños</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {["Cualquiera", "1", "2", "3", "4+"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      bathrooms === option
                        ? "flex-none px-6 py-3 rounded-full bg-primary text-on-primary text-sm font-medium shadow-md"
                        : "flex-none px-6 py-3 rounded-full border border-outline-variant hover:border-primary text-sm font-medium transition-all"
                    }
                    onClick={() => setBathrooms(bathrooms === option ? null : option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Mode */}
          <section className="catalog-sidebar__section">
            <div className="catalog-sidebar__section-heading">
              <h2 className="font-headline text-2xl text-primary">Modo</h2>
              <span className="text-sm text-on-surface-variant">3 opciones</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Venta', 'Venta / Renta', 'Renta'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={
                    selectedMode === option
                      ? 'px-5 py-3 rounded-full bg-primary text-on-primary text-sm font-medium shadow-md'
                      : 'px-5 py-3 rounded-full border border-outline-variant text-sm font-medium text-foreground hover:border-primary transition-all'
                  }
                  onClick={() => setSelectedMode(selectedMode === option ? null : option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          {/* Property Type */}
          <section className="catalog-sidebar__section">
            <h2 className="font-headline text-2xl mb-8 text-primary">Tipo de Propiedad</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Villa', icon: 'villa', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=60' },
                { label: 'Apartamento', icon: 'apartment', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=60' },
                { label: 'Terreno', icon: 'landscape', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60' },
                { label: 'Lote', icon: 'grass', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=60' },
              ].map((type) => (
                <div
                  key={type.label}
                  className={`relative group cursor-pointer overflow-hidden rounded-xl bg-surface-container-low aspect-[4/3] flex flex-col justify-end p-5 transition-all duration-300 ${selectedPropertyType === type.label ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedPropertyType(selectedPropertyType === type.label ? null : type.label)}
                >
                  <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" src={type.image} alt={type.label} />
                  <div className={`absolute inset-0 bg-gradient-to-t ${selectedPropertyType === type.label ? 'from-primary/90' : 'from-on-surface-variant/40'} to-transparent`} />
                  <div className="relative z-10">
                    <span className="material-symbols-outlined text-white mb-2">{type.icon}</span>
                    <p className="text-white font-medium">{type.label}</p>
                  </div>
                  <div className="absolute top-4 right-4 w-5 h-5 border-2 border-white/50 rounded-full flex items-center justify-center">
                    {selectedPropertyType === type.label && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="catalog-sidebar__footer">
            <div>
              <p className="eyebrow">Resultados</p>
              <strong>{filteredProperties.length} propiedades</strong>
            </div>
            <Button variant="secondary" onClick={() => {
              setSelectedLocation(null);
              setSelectedMode(null);
              setMinPrice(500000);
              setMaxPrice(15000000);
              setBedrooms(null);
              setBathrooms(null);
              setSelectedPropertyType(null);
            }}>
              Reiniciar
            </Button>
          </div>

          {activeFilterCount > 0 ? (
            <div className="catalog-sidebar__active-filters">
              <p className="muted">Filtros activos: {activeFilterCount}</p>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="catalog-main">
        <section className="catalog-hero">
          <PageIntro
            eyebrow="Catalogo curado"
            title="Seleccion publica con ritmo editorial y lectura rapida."
            description="El objetivo no es mostrar todo de la misma forma, sino darle jerarquia al inventario y crear deseo antes del contacto."
          />
        </section>

        <section className="section" style={{ paddingTop: "1rem" }}>
          <div className="catalog-toolbar">
            <div className="toolbar-group">
              <Badge variant="outline">Cap Cana</Badge>
              <Badge variant="outline">Las Terrenas</Badge>
              <Badge variant="outline">Venta</Badge>
              <Badge variant="outline">Precio curado</Badge>
            </div>
            <div className="toolbar-group">
              <Badge variant="outline">Villas</Badge>
              <Badge variant="outline">Lotes</Badge>
              <Badge variant="outline">Destacados</Badge>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: "0.5rem" }}>
          {filteredProperties.length === 0 ? (
            <EmptyState
              eyebrow="Inventario en preparacion"
              title="Todavia no hay propiedades publicas cargadas para este catalogo."
              description="La estructura ya esta conectada a Supabase. En cuanto el inventario se publique, esta vista lo reflejara sin rehacer la UI."
            />
          ) : (
            <div className="property-grid">
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
