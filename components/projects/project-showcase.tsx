"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  MapPin, 
  MessageCircle, 
  SlidersHorizontal, 
  X,
  Search,
  ChevronDown,
  BedDouble,
  Bath,
  Maximize,
  Info,
  SortAsc
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PropertyCard } from "@/components/property-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/contact";
import type { ProjectDetailData, PropertyCardData } from "@/lib/properties";
import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type ProjectShowcaseProps = {
  project: ProjectDetailData;
  properties: PropertyCardData[];
};

function formatNumber(value: number | null) {
  if (value === null || value === undefined) {
    return null;
  }

  return new Intl.NumberFormat("es-DO", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);
}

function formatLotRange(min: number | null, max: number | null) {
  const minLabel = formatNumber(min);
  const maxLabel = formatNumber(max);

  if (minLabel && maxLabel && minLabel !== maxLabel) {
    return `${minLabel} - ${maxLabel} m2`;
  }

  if (minLabel || maxLabel) {
    return `${minLabel ?? maxLabel} m2`;
  }

  return "A solicitud";
}

function formatPriceRange(min: number | null, max: number | null) {
  const formatter = new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  if (min !== null && max !== null && min !== max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  if (min !== null || max !== null) {
    return `Desde ${formatter.format(min ?? max ?? 0)}`;
  }

  return "Consultar";
}

export function ProjectShowcase({ project, properties }: ProjectShowcaseProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const propertyTypes = useMemo(() => {
    return Array.from(new Set(properties.map(p => p.type))).filter(Boolean);
  }, [properties]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<string | null>(propertyTypes.length === 1 ? propertyTypes[0] : null);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [rooms, setRooms] = useState<number | null>(null);
  const [baths, setBaths] = useState<number | null>(null);
  const [minArea, setMinArea] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<string>("default");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      if (filterRef.current) {
        const filterTop = filterRef.current.getBoundingClientRect().top;
        setIsFilterSticky(filterTop <= 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isResidencial = useMemo(() => {
    const typeToTest = activeType || (propertyTypes.length === 1 ? propertyTypes[0] : null);
    if (!typeToTest) return true;
    const residentialTypes = ["Apartamento", "Penthouse", "Villa", "Casa", "Estudio", "Solar Residencial"];
    return residentialTypes.some(t => typeToTest.includes(t));
  }, [activeType, propertyTypes]);

  const filteredProperties = useMemo(() => {
    let result = [...properties];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q));
    }
    if (activeType) result = result.filter(p => p.type === activeType);
    if (minPrice !== "") result = result.filter(p => (p.priceAmount ?? 0) >= Number(minPrice));
    if (maxPrice !== "") result = result.filter(p => (p.priceAmount ?? 0) <= Number(maxPrice));
    if (isResidencial) {
      if (rooms) result = result.filter(p => p.bedrooms === rooms);
      if (baths) result = result.filter(p => p.bathrooms === baths);
    }
    if (minArea !== "") {
      result = result.filter(p => {
        const areaValue = parseFloat(p.area.replace(/[^0-9.]/g, ''));
        return areaValue >= Number(minArea);
      });
    }
    if (sortBy === "price-asc") result.sort((a, b) => (a.priceAmount ?? 0) - (b.priceAmount ?? 0));
    else if (sortBy === "price-desc") result.sort((a, b) => (b.priceAmount ?? 0) - (a.priceAmount ?? 0));
    return result;
  }, [properties, searchQuery, activeType, minPrice, maxPrice, rooms, baths, minArea, sortBy, isResidencial]);

  const resetFilters = () => {
    setSearchQuery(""); setActiveType(propertyTypes.length === 1 ? propertyTypes[0] : null);
    setMinPrice(""); setMaxPrice(""); setRooms(null); setBaths(null); setMinArea(""); setSortBy("default");
  };

  const hasActiveFilters = (propertyTypes.length > 1 && activeType) || rooms || baths || minPrice || maxPrice || minArea || searchQuery !== "" || sortBy !== "default";

  return (
    <div className="page-shell relative flex flex-col gap-16 pb-20 pt-8 lg:gap-20">
      {/* Botón de Retorno Minimalista */}
      <div className={`fixed top-[100px] left-4 lg:left-8 z-[60] transition-all duration-700 ${
        scrolled ? 'opacity-100' : 'opacity-40 hover:opacity-100'
      }`}>
        <Link
          href="/catalogo"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/10 bg-white/40 backdrop-blur-md text-primary/40 transition-all hover:bg-white hover:text-primary hover:border-primary/20 hover:scale-110"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </Link>
      </div>

      <section className="grid gap-12 mt-12 lg:mt-0">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
          <div className="grid gap-7">
            <div className="flex flex-wrap gap-3">
              <Badge variant="chip">Proyecto</Badge>
              {project.location ? (
                <Badge variant="metric" className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {project.location}
                </Badge>
              ) : null}
            </div>
            <div className="grid gap-5">
              <h1 className="m-0 font-serif text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.9] tracking-[-0.04em] text-balance italic text-primary">
                {project.name}
              </h1>
              <p className="max-w-3xl text-[1.05rem] leading-[1.7] text-primary/70">
                {project.description || project.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-5 pt-2">
              <Button asChild size="lg" className="rounded-full px-10 h-14 bg-primary text-white shadow-xl">
                <a href="#inventario" className="inline-flex items-center gap-3 font-bold tracking-widest text-[10px] uppercase">
                  Ver Disponibles <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-deep shadow-2xl group">
            {project.mainImageUrl ? (
              <img src={project.mainImageUrl} alt={project.name} className="aspect-[4/5] w-full object-cover lg:aspect-[5/4] transition-transform duration-[2000ms] group-hover:scale-105" />
            ) : (
              <div className="aspect-[4/5] w-full bg-primary/5 lg:aspect-[5/4]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-40" />
          </div>
        </div>
      </section>

      {/* SECCIÓN DE INVENTARIO CON FILTROS ADAPTATIVOS STICKY */}
      {project.inventorySummaries.length > 0 ? (
        <section className="grid gap-8 border-t border-primary/5 pt-16">
          <div className="flex flex-col gap-4 px-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-primary/35">
                Resumen comercial
              </p>
              <h2 className="m-0 font-serif text-[clamp(2rem,4vw,3.3rem)] italic leading-none tracking-[-0.03em] text-primary">
                Rangos de villas y lotes.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-primary/55">
              Vista rapida por tipologia: tamano de lote, metraje habitable, precio y cantidad disponible.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-xl shadow-primary/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead className="bg-surface-soft/70 text-[10px] font-bold uppercase tracking-[0.22em] text-primary/40">
                  <tr>
                    <th className="px-7 py-5">Modelo</th>
                    <th className="px-7 py-5">Lote</th>
                    <th className="px-7 py-5">Habitabilidad</th>
                    <th className="px-7 py-5">Precio</th>
                    <th className="px-7 py-5 text-right">Disponibles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {project.inventorySummaries.map((summary) => {
                    const habitableLabel = formatNumber(summary.habitableAreaM2);
                    const constructionLabel = formatNumber(summary.constructionAreaM2);
                    const availabilityLabel =
                      summary.totalLots > 0 && summary.totalLots !== summary.availableLots
                        ? `${summary.availableLots} / ${summary.totalLots}`
                        : `${summary.availableLots}`;

                    return (
                      <tr key={summary.id} className="transition-colors hover:bg-surface-soft/45">
                        <td className="px-7 py-6 align-top">
                          <div className="grid gap-2">
                            <span className="font-serif text-xl italic leading-tight text-primary">
                              {summary.modelName}
                            </span>
                            {summary.statusNote ? (
                              <span className="text-xs leading-5 text-primary/45">{summary.statusNote}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-7 py-6 align-top text-sm font-semibold text-primary">
                          {formatLotRange(summary.lotSizeMinM2, summary.lotSizeMaxM2)}
                        </td>
                        <td className="px-7 py-6 align-top">
                          <div className="flex flex-wrap gap-2">
                            {habitableLabel ? (
                              <Badge variant="metric">{habitableLabel} m2 hab.</Badge>
                            ) : null}
                            {constructionLabel ? (
                              <Badge variant="metric">{constructionLabel} m2 const.</Badge>
                            ) : null}
                            {summary.bedrooms ? (
                              <Badge variant="chip" className="inline-flex items-center gap-1.5">
                                <BedDouble className="h-3.5 w-3.5" />
                                {summary.bedrooms}
                              </Badge>
                            ) : null}
                            {summary.bathrooms ? (
                              <Badge variant="chip" className="inline-flex items-center gap-1.5">
                                <Bath className="h-3.5 w-3.5" />
                                {formatNumber(summary.bathrooms)}
                              </Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-7 py-6 align-top text-sm font-bold text-primary">
                          {formatPriceRange(summary.priceMin, summary.priceMax)}
                        </td>
                        <td className="px-7 py-6 align-top text-right">
                          <span className="font-serif text-2xl italic leading-none text-primary">
                            {availabilityLabel}
                          </span>
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-primary/35">
                            lotes
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      <section id="inventario" className="grid gap-12 pt-20 border-t border-primary/5 min-h-[100vh]" ref={filterRef}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <h2 className="m-0 font-serif text-[clamp(2.2rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em] italic text-primary">
            Inmuebles.
          </h2>
          <div className="flex items-center gap-2 text-primary/40 text-[10px] font-bold uppercase tracking-widest">
            <span className="font-serif italic text-lg lowercase">{filteredProperties.length}</span>
            unidades
          </div>
        </div>

        {/* BARRA DE FILTROS - STICKY CON COMPENSACIÓN DE GAP */}
        <div className={cn(
          "transition-all duration-500 ease-in-out z-50",
          isFilterSticky ? "fixed top-[105px] left-0 right-0 px-4 lg:px-12 animate-in slide-in-from-top-4" : "relative"
        )}>
          <div className={cn(
            "mx-auto max-w-[var(--max-width)] bg-white/70 backdrop-blur-[32px] rounded-[2.5rem] border border-primary/5 shadow-2xl transition-all duration-500",
            isFilterSticky ? "p-2.5 lg:py-2.5 lg:px-6 shadow-primary/10 border-white/20" : "p-6 lg:p-8"
          )}>
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Buscador */}
              <div className="relative flex-1 group w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder={isFilterSticky ? "Escribe para buscar..." : "Nombre de unidad o palabra clave..."} 
                  className={cn(
                    "w-full pl-14 pr-6 bg-white/40 backdrop-blur-sm rounded-full border border-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all text-[13px] text-primary placeholder:text-primary/30",
                    isFilterSticky ? "h-11" : "h-14"
                  )}
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <Button 
                  onClick={() => setShowAdvanced(!showAdvanced)} 
                  variant="secondary" 
                  className={cn(
                    "rounded-full flex items-center gap-3 transition-all",
                    isFilterSticky ? "h-11 px-6" : "h-14 px-8",
                    showAdvanced && 'bg-primary text-white shadow-lg'
                  )}
                >
                  <SlidersHorizontal size={16} /> 
                  <span className="uppercase tracking-widest text-[10px] font-bold">Filtros</span>
                  {hasActiveFilters && !showAdvanced && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                </Button>

                {hasActiveFilters && (
                  <button 
                    onClick={resetFilters} 
                    className={cn(
                      "flex items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-300",
                      isFilterSticky ? "w-11 h-11" : "w-12 h-12 lg:w-14 lg:h-14"
                    )}
                    title="Limpiar selección"
                  >
                    <X size={18} />
                  </button>
                )}

                <div className="relative group/sort">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30 pointer-events-none">
                    <SortAsc size={14} />
                  </div>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)} 
                    className={cn(
                      "appearance-none bg-white/40 backdrop-blur-sm rounded-full border border-primary/5 focus:outline-none text-[10px] font-bold text-primary/50 uppercase tracking-widest pl-12 pr-10 hover:bg-white/60 cursor-pointer transition-all",
                      isFilterSticky ? "h-11" : "h-14"
                    )}
                  >
                    <option value="default">Orden</option>
                    <option value="price-asc">Menor Precio</option>
                    <option value="price-desc">Mayor Precio</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/20 pointer-events-none group-hover/sort:translate-y-[-40%] transition-transform" size={12} />
                </div>
              </div>
            </div>

            {/* Panel Avanzado Desplegable */}
            {showAdvanced && (
              <div className="grid gap-10 pt-8 mt-6 border-t border-primary/5 animate-in fade-in slide-in-from-top-4 duration-500 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 px-2 pb-4">
                  {propertyTypes.length > 1 && (
                    <div className="grid gap-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/30 px-1">Tipología</label>
                      <div className="flex flex-wrap gap-2">
                        {propertyTypes.map(type => (
                          <button key={type} onClick={() => setActiveType(activeType === type ? null : type)} className={cn("px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all", activeType === type ? 'bg-primary text-white shadow-lg' : 'bg-surface-soft text-primary/40 hover:text-primary')}>{type}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/30 px-1">{isResidencial ? "Distribución" : "Superficie"}</label>
                    {isResidencial ? (
                      <div className="flex flex-col gap-6">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map(num => (
                            <button key={num} onClick={() => setRooms(rooms === num ? null : num)} className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold transition-all", rooms === num ? 'bg-primary text-white' : 'bg-surface-soft text-primary/40 hover:text-primary')}>{num}</button>
                          ))}
                          <span className="text-[9px] text-primary/20 font-bold ml-2 self-center tracking-widest uppercase">Hab</span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3].map(num => (
                            <button key={num} onClick={() => setBaths(baths === num ? null : num)} className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold transition-all", baths === num ? 'bg-primary text-white' : 'bg-surface-soft text-primary/40 hover:text-primary')}>{num}</button>
                          ))}
                          <span className="text-[9px] text-primary/20 font-bold ml-2 self-center tracking-widest uppercase">Baños</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group/area">
                        <Maximize className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/15 group-focus-within/area:text-primary" size={16} />
                        <input type="number" placeholder="Área mínima m²..." className="w-full pl-12 pr-6 h-12 bg-surface-soft/60 rounded-xl border-none focus:outline-none text-sm transition-all" value={minArea} onChange={(e) => setMinArea(e.target.value ? Number(e.target.value) : "")}/>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/30 px-1">Presupuesto</label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 group/price">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/10 text-[9px] font-bold uppercase">Min</div>
                        <input type="number" placeholder="USD" value={minPrice} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")} className="w-full pl-12 pr-4 h-12 bg-surface-soft/60 rounded-xl border-none focus:outline-none text-xs font-bold text-primary"/>
                      </div>
                      <div className="relative flex-1 group/price">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/10 text-[9px] font-bold uppercase">Max</div>
                        <input type="number" placeholder="USD" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")} className="w-full pl-12 pr-4 h-12 bg-surface-soft/60 rounded-xl border-none focus:outline-none text-xs font-bold text-primary"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LISTADO DE RESULTADOS - MEJORADO: Gap compensatorio cuando el filtro es sticky */}
        <div className={cn(
          "grid gap-10 md:grid-cols-2 xl:grid-cols-3 transition-all duration-700",
          isFilterSticky ? "mt-48 lg:mt-32" : "mt-4"
        )}>
          {filteredProperties.length === 0 ? (
            <div className="col-span-full py-20">
              <EmptyState eyebrow="Búsqueda" title="Sin resultados" description="Intenta ajustar tus criterios de búsqueda para encontrar más opciones." />
            </div>
          ) : (
            filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
