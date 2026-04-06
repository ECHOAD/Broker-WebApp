export type Property = {
  slug: string;
  title: string;
  project: string;
  type: "Villa" | "Lote" | "Edificio";
  listingMode: "Venta" | "Renta" | "Venta / Renta";
  status: "Disponible" | "Reservado" | "Sold";
  location: string;
  priceLabel: string;
  priceValue: number | null;
  currency: "USD";
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  pitch: string;
  story: string;
  features: string[];
  collection: string;
};

export const featuredProperties: Property[] = [
  {
    slug: "obsidian-sanctuary",
    title: "The Obsidian Sanctuary",
    project: "Aurelian Coast",
    type: "Villa",
    listingMode: "Venta",
    status: "Disponible",
    location: "Cap Cana, República Dominicana",
    priceLabel: "US$ 2.95M",
    priceValue: 2950000,
    currency: "USD",
    bedrooms: 5,
    bathrooms: 5,
    area: "620 m² interiores · 1,900 m² lote",
    pitch: "Villa de líneas serenas, patio acuático y secuencia de espacios pensada para hospitalidad de alto nivel.",
    story:
      "Diseñada como refugio editorial frente al mar, combina piedra cálida, madera oscura y aperturas controladas para una experiencia silenciosa y premium.",
    features: ["Piscina de espejo", "Club de playa cercano", "Suite de huéspedes", "Terraza sunset"],
    collection: "Signature Villas",
  },
  {
    slug: "azure-enclave",
    title: "The Azure Enclave",
    project: "Azure Enclave",
    type: "Lote",
    listingMode: "Venta",
    status: "Disponible",
    location: "Las Terrenas, Samaná",
    priceLabel: "US$ 540K",
    priceValue: 540000,
    currency: "USD",
    area: "2,400 m² con frente verde",
    pitch: "Lote premium para residencia de baja densidad con visuales limpias y acceso rápido a playa y club.",
    story:
      "Una pieza pensada para quien quiere construir con ritmo lento y lenguaje contemporáneo, sin perder cercanía con la costa.",
    features: ["Vista abierta", "Topografía noble", "Acceso controlado", "Baja densidad"],
    collection: "Curated Lots",
  },
  {
    slug: "terracotta-house",
    title: "Terracotta House",
    project: "Costa Reserva",
    type: "Villa",
    listingMode: "Venta / Renta",
    status: "Reservado",
    location: "Punta Cana Village",
    priceLabel: "Consultar precio",
    priceValue: null,
    currency: "USD",
    bedrooms: 4,
    bathrooms: 4,
    area: "480 m² interiores · jardín privado",
    pitch: "Residencia cálida con circulación abierta, comedor exterior y un lenguaje más doméstico, menos ostentoso.",
    story:
      "La propuesta apunta a familias que valoran privacidad, textura material y una atmósfera relajada con excelente operatividad.",
    features: ["Lounge exterior", "Cocina social", "Riego automatizado", "Renta corta viable"],
    collection: "Family Retreats",
  },
];

export const platformMetrics = [
  { label: "Inventario curado", value: "42 activos" },
  { label: "Leads en seguimiento", value: "18 oportunidades" },
  { label: "Conversión a cita", value: "39%" },
  { label: "Ticket objetivo", value: "US$ 1.4M" },
];

export const leadPipeline = [
  { stage: "Nuevo", count: 8 },
  { stage: "Contactado", count: 6 },
  { stage: "Cita", count: 3 },
  { stage: "Negociación", count: 1 },
];

export function getPropertyBySlug(slug: string) {
  return featuredProperties.find((property) => property.slug === slug);
}
