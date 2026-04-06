import { PropertyCard } from "@/components/property-card";
import { SitePage } from "@/components/layout/site-page";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageIntro } from "@/components/shared/page-intro";
import { listPublicProperties } from "@/lib/properties";

export const revalidate = 300;

export default async function CatalogoPage() {
  const properties = await listPublicProperties();

  return (
    <SitePage>
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
        {properties.length === 0 ? (
          <EmptyState
            eyebrow="Inventario en preparacion"
            title="Todavia no hay propiedades publicas cargadas para este catalogo."
            description="La estructura ya esta conectada a Supabase. En cuanto el inventario se publique, esta vista lo reflejara sin rehacer la UI."
          />
        ) : (
          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>
        )}
      </section>
    </SitePage>
  );
}
