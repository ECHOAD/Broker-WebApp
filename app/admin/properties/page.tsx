import { requireBrokerAdmin } from "@/lib/auth";
import {
  PROPERTY_STATUS_LABELS,
  LISTING_MODE_LABELS,
  formatCurrency,
} from "@/lib/admin";
import { Database } from "@/lib/supabase/database.types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bath, BedDouble, Building2, Car, ChevronLeft, FolderKanban, Pencil, Plus, Ruler, Star } from "lucide-react";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyTypeRow = Database["public"]["Tables"]["property_types"]["Row"];

type PropertiesPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

type PropertyWithMedia = Pick<
  PropertyRow,
  | "id"
  | "project_id"
  | "property_type_id"
  | "slug"
  | "title"
  | "summary"
  | "description"
  | "listing_mode"
  | "commercial_status"
  | "price_mode"
  | "base_currency"
  | "price_amount"
  | "price_min_amount"
  | "price_max_amount"
  | "bedrooms"
  | "bathrooms"
  | "parking_spaces"
  | "construction_area_m2"
  | "lot_area_m2"
  | "lot_area_min_m2"
  | "lot_area_max_m2"
  | "approximate_location_text"
  | "whatsapp_phone"
  | "is_featured"
  | "created_at"
  | "published_at"
> & {
  property_media: Array<{ id: string; storage_path: string; is_cover: boolean }>;
};

export const dynamic = "force-dynamic";

function formatPropertyPrice(property: PropertyWithMedia) {
  if (property.price_mode !== "range") {
    return formatCurrency(property.price_amount, property.base_currency, property.price_mode);
  }

  const min = property.price_min_amount ?? property.price_amount;
  const max = property.price_max_amount;

  if (min !== null && max !== null && min !== max) {
    return `${formatCurrency(min, property.base_currency, "fixed")} - ${formatCurrency(max, property.base_currency, "fixed")}`;
  }

  return formatCurrency(min, property.base_currency, "range");
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const { project: projectParam } = await searchParams;
  if (!projectParam || projectParam === "new") {
    redirect("/admin/projects");
  }

  const { supabase } = await requireBrokerAdmin();

  const [
    { data: propertiesData, error: propertiesError },
    { data: projectsData, error: projectsError },
    { data: propertyTypesData, error: propertyTypesError },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select(
        "id, project_id, property_type_id, slug, title, summary, description, listing_mode, commercial_status, price_mode, base_currency, price_amount, price_min_amount, price_max_amount, bedrooms, bathrooms, parking_spaces, construction_area_m2, lot_area_m2, lot_area_min_m2, lot_area_max_m2, approximate_location_text, whatsapp_phone, is_featured, created_at, published_at, property_media(id, storage_path, is_cover)",
      )
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name, status")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("property_types").select("id, slug, label_es, label_en").order("label_es"),
  ]);

  if (propertiesError || projectsError || propertyTypesError) {
    throw new Error(
      propertiesError?.message ?? projectsError?.message ?? propertyTypesError?.message ?? "No pudimos leer las propiedades.",
    );
  }

  const properties = (propertiesData ?? []) as unknown as PropertyWithMedia[];
  const projects = (projectsData ?? []) as Array<Pick<ProjectRow, "id" | "name" | "status">>;
  const propertyTypes = (propertyTypesData ?? []) as Array<Pick<PropertyTypeRow, "id" | "slug" | "label_es" | "label_en">>;

  const propertyTypeById = new Map(propertyTypes.map((propertyType) => [propertyType.id, propertyType]));
  const propertiesByProjectId = new Map<string, typeof properties>();

  for (const property of properties) {
    if (!property.project_id) continue;
    const bucket = propertiesByProjectId.get(property.project_id) ?? [];
    bucket.push(property);
    propertiesByProjectId.set(property.project_id, bucket);
  }

  const selectedProjectFromParam =
    projectParam && projectParam !== "new" ? projects.find((project) => project.id === projectParam) ?? null : null;

  const selectedProject = selectedProjectFromParam;
  if (!selectedProject) {
    redirect("/admin/projects");
  }

  const selectedProjectProperties = propertiesByProjectId.get(selectedProject.id) ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-6 border-b border-slate-200 pb-6">
        <Link
          href={`/admin/projects/${selectedProject.id}`}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al proyecto
        </Link>
        <div className="flex flex-col gap-6 rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.04)] md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Paso 2 de 2 | Inmuebles</p>
            <h1 className="font-serif text-4xl tracking-tight text-slate-900 m-0">{selectedProject.name}</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Estás manteniendo únicamente las unidades de este proyecto. Para trabajar otro inventario, vuelve al proyecto correspondiente.
            </p>
          </div>
          <div className="flex h-12 w-fit items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-6 text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-xl shadow-slate-200/70">
            <Building2 className="h-4 w-4" />
            {selectedProjectProperties.length} inmuebles
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Link href={`/admin/projects/${selectedProject.id}`} className="rounded-2xl border border-slate-100 bg-white/60 p-4 transition-colors hover:bg-white">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">1</span>
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-widest text-slate-900">Proyecto</p>
                <p className="m-0 text-xs text-slate-400">Marca, portada, narrativa y visibilidad.</p>
              </div>
              <FolderKanban className="ml-auto h-4 w-4 text-slate-300" />
            </div>
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-800">2</span>
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-widest text-slate-900">Inmuebles</p>
                <p className="m-0 text-xs text-slate-400">Unidades, precios, media y disponibilidad.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex justify-end">
        <Link
          href={`/admin/properties/new?project=${selectedProject.id}`}
          className="inline-flex h-12 items-center justify-center gap-3 rounded-[18px] border border-slate-200 bg-white px-6 text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-xl shadow-slate-200/70 transition-all hover:border-slate-300 hover:text-slate-950"
        >
          <Plus className="h-4 w-4" />
          Nuevo inmueble
        </Link>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.04)]">
        {selectedProjectProperties.length === 0 ? (
          <div className="grid gap-4 p-10 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Inventario vacío</p>
            <h2 className="font-serif text-3xl text-slate-900">Este proyecto todavía no tiene inmuebles.</h2>
            <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">
              Crea la primera unidad para comenzar a cargar precios, características y galería.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Inmueble</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Tipo / modo</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Precio</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Características</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Estado</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selectedProjectProperties.map((property) => {
                  const cover = property.property_media.find((media) => media.is_cover) ?? property.property_media[0] ?? null;
                  const coverUrl = cover
                    ? supabase.storage.from("property-media").getPublicUrl(cover.storage_path).data.publicUrl
                    : null;
                  const typeLabel = propertyTypeById.get(property.property_type_id)?.label_es ?? "Tipo sin etiqueta";

                  return (
                    <tr key={property.id} className="group transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                            {coverUrl ? (
                              <img src={coverUrl} alt={`Imagen de ${property.title}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-300">
                                <Building2 className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/properties/${property.id}?project=${selectedProject.id}`} className="font-serif text-xl text-slate-900 transition-colors hover:text-slate-600">
                                {property.title}
                              </Link>
                              {property.is_featured ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : null}
                            </div>
                            <p className="mt-1 text-xs font-medium text-slate-400">/{property.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="grid gap-1">
                          <span className="text-sm font-semibold text-slate-800">{typeLabel}</span>
                          <span className="text-xs text-slate-400">{LISTING_MODE_LABELS[property.listing_mode]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                        {formatPropertyPrice(property)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {property.bedrooms !== null ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><BedDouble className="h-3 w-3" />{property.bedrooms}</span> : null}
                          {property.bathrooms !== null ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Bath className="h-3 w-3" />{property.bathrooms}</span> : null}
                          {property.parking_spaces !== null ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Car className="h-3 w-3" />{property.parking_spaces}</span> : null}
                          {property.construction_area_m2 !== null ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1"><Ruler className="h-3 w-3" />{property.construction_area_m2} m²</span> : null}
                          {property.lot_area_min_m2 !== null || property.lot_area_max_m2 !== null ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                              <Ruler className="h-3 w-3" />
                              {property.lot_area_min_m2 ?? property.lot_area_max_m2}
                              {property.lot_area_max_m2 && property.lot_area_max_m2 !== property.lot_area_min_m2
                                ? `-${property.lot_area_max_m2}`
                                : ""}{" "}
                              m² lote
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          {PROPERTY_STATUS_LABELS[property.commercial_status]}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <Link
                            href={`/admin/properties/${property.id}?project=${selectedProject.id}`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-slate-700 transition-all hover:border-slate-300 hover:text-slate-950 hover:shadow-sm"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
