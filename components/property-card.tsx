import Link from "next/link";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyCardData } from "@/lib/properties";

type PropertyCardProps = {
  property: PropertyCardData;
  navigationMode?: "direct" | "project";
};

export function PropertyCard({ property, navigationMode = "direct" }: PropertyCardProps) {
  const shouldRouteThroughProject = navigationMode === "project" && property.projectSlug;
  const primaryHref = shouldRouteThroughProject
    ? `/proyectos/${property.projectSlug}`
    : `/propiedades/${property.slug}`;
  const primaryLabel = shouldRouteThroughProject ? "Ver proyecto" : "Ver propiedad";
  const supportCopy = shouldRouteThroughProject
    ? "Accede a esta propiedad entrando primero al proyecto."
    : "Detalle completo de la propiedad.";

  return (
    <article className="property-card">
      <div className="property-card__visual">
        <div />
      </div>

      <div className="property-card__body">
        <div className="chip-row">
          <Badge variant="chip">{property.badge}</Badge>
          <Badge variant="chip">{property.status}</Badge>
        </div>

        <div>
          <p className="eyebrow">{property.project}</p>
          <h3 className="section-title" style={{ fontSize: "2rem" }}>
            {property.title}
          </h3>
        </div>

        <p className="muted">{property.pitch}</p>

        <p className="eyebrow m-0 opacity-50 normal-case tracking-[0.06em]">{supportCopy}</p>

        <div className="meta-row">
          <Badge variant="metric">{property.type}</Badge>
          <Badge variant="metric">{property.listingMode}</Badge>
          <Badge variant="metric">{property.area}</Badge>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "end",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p className="eyebrow">Precio</p>
            <strong style={{ fontSize: "1.35rem" }}>{property.priceLabel}</strong>
          </div>

          <div className="property-card__actions">
            <FavoriteToggle propertyId={property.id} />
            <Button asChild>
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
