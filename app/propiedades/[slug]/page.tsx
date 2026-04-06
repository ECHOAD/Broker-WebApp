import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { PropertyLeadForm } from "@/components/property-lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicPropertyBySlug, getPublicPropertySlugs } from "@/lib/properties";

type PropertyDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPublicPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <section className="detail-hero">
          <div className="detail-hero__visual">
            <div />
          </div>

          <aside className="detail-panel">
            <div className="chip-row">
              <Badge variant="chip">{property.badge}</Badge>
              <Badge variant="chip">{property.status}</Badge>
            </div>

            <div>
              <p className="eyebrow">{property.project}</p>
              <h1 className="section-title">{property.title}</h1>
            </div>

            <p className="muted">{property.story}</p>

            <div className="detail-meta">
              <Badge variant="metric">{property.type}</Badge>
              <Badge variant="metric">{property.listingMode}</Badge>
              <Badge variant="metric">{property.location}</Badge>
            </div>

            <div className="copy-card" style={{ padding: "1.25rem" }}>
              <p className="eyebrow">Precio</p>
              <h2 style={{ margin: "0.2rem 0 0.8rem", fontSize: "2rem" }}>{property.priceLabel}</h2>
              <p className="muted" style={{ marginTop: 0 }}>
                Contacto estructurado primero, conversacion de WhatsApp despues. Ese flujo ya esta
                contemplado en Supabase.
              </p>
              <div className="chip-row">
                <FavoriteToggle propertyId={property.id} />
                <Button asChild>
                  <Link href="/catalogo">Volver al catalogo</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/admin">Ver tracking admin</Link>
                </Button>
              </div>
            </div>
          </aside>
        </section>

        <section className="section">
          <div className="detail-columns">
            <div className="story-stack">
              <div className="copy-card">
                <p className="eyebrow">Narrativa</p>
                <h2 className="section-title" style={{ fontSize: "2.2rem" }}>
                  Un detalle de propiedad hecho para vender contexto, no solo atributos.
                </h2>
                <p className="muted">{property.pitch}</p>
                <p className="muted">{property.description}</p>
              </div>

              <div className="timeline-card">
                <p className="eyebrow">Highlights</p>
                <ul>
                  {property.highlights.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="story-stack">
              <div className="info-card">
                <p className="eyebrow">Ficha rapida</p>
                <ul>
                  <li>Ubicacion aproximada: {property.location}</li>
                  <li>Area: {property.area}</li>
                  {property.bedrooms ? <li>Dormitorios: {property.bedrooms}</li> : null}
                  {property.bathrooms ? <li>Banos: {property.bathrooms}</li> : null}
                  {property.parkingSpaces ? <li>Parqueos: {property.parkingSpaces}</li> : null}
                  <li>Estado comercial: {property.status}</li>
                </ul>
              </div>

              <div className="copy-card">
                <p className="eyebrow">Ruta comercial</p>
                <p className="muted">
                  Esta ficha ya registra consultas en `leads` y `lead_property_interests` antes de
                  enviar al prospecto a WhatsApp.
                </p>
              </div>

              <PropertyLeadForm
                propertyId={property.id}
                propertySlug={property.slug}
                propertyTitle={property.title}
                whatsappPhone={property.whatsappPhone}
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
