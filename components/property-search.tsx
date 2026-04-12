"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { SearchableSelect } from "@/components/ui/searchable-select";

type PropertySearchProps = {
  projects: { id: string; name: string; slug: string }[];
  propertyTypes: { id: string; label_es: string; slug: string }[];
  locations: string[];
};

export function PropertySearch({ projects, propertyTypes, locations }: PropertySearchProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (projectId) params.set("project", projectId);
    if (typeId) params.set("type", typeId);
    if (minPrice > 0) params.set("minPrice", minPrice.toString());
    if (maxPrice > 0) params.set("maxPrice", maxPrice.toString());
    if (location) params.set("location", location);

    router.push(`/catalogo?${params.toString()}`);
  };

  const projectOptions = projects.map(p => ({ value: p.name, label: p.name }));
  const typeOptions = propertyTypes.map(t => ({ value: t.label_es, label: t.label_es }));
  const locationOptions = locations.map(l => ({ value: l, label: l }));

  return (
    <div className="w-full max-w-6xl mx-auto -mt-12 relative z-30">
      {/* Search card with modern glassmorphism */}
      <div className="bg-white/95 backdrop-blur-2xl border border-white/60 shadow-[0_40px_80px_-20px_rgba(0,51,54,0.15)] rounded-[2rem]">

        {/* Header Section */}
        <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent px-6 lg:px-8 pt-6 pb-5 border-b border-primary/10 rounded-t-[2rem]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Buscador Inteligente</p>
              </div>
              <h3 className="font-serif text-2xl lg:text-3xl text-foreground leading-tight">
                Encuentra tu próxima inversión
              </h3>
              <p className="text-sm text-muted mt-1.5 max-w-2xl">
                Filtra por ubicación, tipo de propiedad, proyecto y rango de precio para ver opciones que se ajusten a tu criterio.
              </p>
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="p-6 lg:p-8 rounded-b-[2rem] overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-end">

          {/* Localidad */}
          <div className="lg:col-span-2">
            <SearchableSelect
              label="Localidad"
              icon={MapPin}
              value={location}
              onChange={setLocation}
              options={locationOptions}
              placeholder="Todas las zonas"
            />
          </div>

          {/* Tipo de Inmueble */}
          <div className="lg:col-span-2">
            <SearchableSelect
              label="Tipo"
              icon={Building2}
              value={typeId}
              onChange={setTypeId}
              options={typeOptions}
              placeholder="Todos los tipos"
            />
          </div>

          {/* Proyecto */}
          <div className="lg:col-span-3">
            <SearchableSelect
              label="Proyecto"
              icon={Briefcase}
              value={projectId}
              onChange={setProjectId}
              options={projectOptions}
              placeholder="Todos los proyectos"
            />
          </div>

          {/* Rango de Precio */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <MoneyInput
                label="Mínimo (USD)"
                value={minPrice}
                onChange={setMinPrice}
                placeholder="0"
              />
              <MoneyInput
                label="Máximo (USD)"
                value={maxPrice}
                onChange={setMaxPrice}
                placeholder="Cualquiera"
              />
            </div>
          </div>

          {/* Botón Buscar */}
          <div className="lg:col-span-2">
            <Button
              onClick={handleSearch}
              className="w-full !text-white bg-gradient-to-br from-primary to-primary-soft hover:from-primary-soft hover:to-primary rounded-2xl h-14 px-8 flex items-center justify-center gap-3 shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold text-base"
            >
              <Search className="w-5 h-5" />
              <span className="uppercase tracking-wider">Buscar</span>
            </Button>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}
