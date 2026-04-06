import Link from "next/link";
import { BrokerWavePortrait } from "@/components/broker-wave-portrait";
import { PropertyCard } from "@/components/property-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listPublicProperties } from "@/lib/properties";

export const revalidate = 300;

export default async function HomePage() {
  const publicProperties = await listPublicProperties();
  const featuredProperties = publicProperties.slice(0, 3);
  const heroProperty = featuredProperties[0] ?? publicProperties[0] ?? null;
  const projectCount = new Set(
    publicProperties
      .map((property) => property.project)
      .filter((project) => project && project !== "Seleccion privada"),
  ).size;
  const availableCount = publicProperties.filter((property) => property.status === "Disponible").length;
  const priceModes = [...new Set(publicProperties.map((property) => property.listingMode))].slice(0, 3);
  const keyLocations = [...new Set(publicProperties.map((property) => property.location))].slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="section landing-home">
          <div className="page-shell">
            <div className="landing-stage">
              <div className="landing-stage__copy">
                <div className="landing-stage__header">
                  <p className="eyebrow">Broker inmobiliario en Republica Dominicana</p>
                  <h1 className="display-title landing-stage__title">
                    Comprar bien empieza con alguien que filtra mejor.
                  </h1>
                  <p className="landing-stage__lede">
                    Encuentra proyectos e inmuebles con una lectura mas clara de ubicacion,
                    oportunidad y estilo de vida. Menos ruido. Mejor criterio. Mejor conversacion
                    desde el primer contacto.
                  </p>
                </div>

                <div className="chip-row">
                  <Badge variant="outline">Compra</Badge>
                  <Badge variant="outline">Renta</Badge>
                  <Badge variant="outline">Inversion</Badge>
                  <Badge variant="outline">Acompanamiento directo</Badge>
                </div>

                <div className="landing-stage__actions">
                  <Button asChild size="lg">
                    <Link href="/catalogo">Explorar catalogo</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <Link href="#broker">Conocer al broker</Link>
                  </Button>
                </div>

                <div className="landing-search-panel">
                  <div className="landing-search-panel__tabs">
                    <span className="landing-search-panel__tab is-active">Comprar</span>
                    <span className="landing-search-panel__tab">Alquilar</span>
                  </div>

                  <div className="landing-search-panel__grid">
                    <div className="landing-search-chip landing-search-chip--wide">
                      <span className="landing-search-chip__label">Zonas clave</span>
                      <strong>
                        {keyLocations.length > 0
                          ? keyLocations.join(" | ")
                          : "Cap Cana | Punta Cana | Las Terrenas"}
                      </strong>
                    </div>
                    <div className="landing-search-chip">
                      <span className="landing-search-chip__label">Proyectos</span>
                      <strong>{projectCount} activos en foco</strong>
                    </div>
                    <div className="landing-search-chip">
                      <span className="landing-search-chip__label">Disponibles</span>
                      <strong>{availableCount} opciones hoy</strong>
                    </div>
                    <div className="landing-search-chip">
                      <span className="landing-search-chip__label">Modo</span>
                      <strong>{priceModes.join(" | ") || "Venta | Renta"}</strong>
                    </div>
                    <Button asChild className="landing-search-panel__button" size="lg">
                      <Link href="/catalogo">Buscar propiedades</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="landing-stage__visual">
                <div className="landing-stage__halo landing-stage__halo--one" />
                <div className="landing-stage__halo landing-stage__halo--two" />
                <BrokerWavePortrait className="landing-stage__portrait"  imageSrc={'./broker-photo.jpeg'}/>
                <div className="landing-stage__floating-note">
                  <p className="eyebrow">Selecciones con criterio</p>
                  <strong>
                    {heroProperty?.project ?? "Colecciones privadas"} con lectura editorial y mejor
                    entrada comercial.
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="broker">
          <div className="page-shell broker-story-grid">
            <div className="broker-story-card">
              <p className="eyebrow">Sobre el broker</p>
              <h2 className="section-title">Carlos Realto</h2>
              <p className="muted">
                Trabajo la busqueda inmobiliaria como una curaduria comercial. Antes de proponerte
                una visita, ordeno el contexto del proyecto, la ubicacion y el valor real de cada
                activo para que la decision se sienta mas clara y menos pesada.
              </p>
              <blockquote className="broker-story-card__quote">
                "Mi trabajo no es mostrarte todo. Es mostrarte primero lo que de verdad merece tu
                tiempo."
              </blockquote>
              <div className="chip-row">
                <Badge variant="outline">Asesoria personal</Badge>
                <Badge variant="outline">Comparacion guiada</Badge>
                <Badge variant="outline">Negociacion</Badge>
              </div>
            </div>

            <div className="broker-story-stack">
              <div className="broker-proof-card">
                <p className="eyebrow">Como acompano</p>
                <ul>
                  <li>Filtro proyectos y propiedades antes de recomendar una ruta de visita.</li>
                  <li>Traduzco precio, potencial y encaje del activo en decisiones mas concretas.</li>
                  <li>Mantengo el seguimiento comercial hasta que la oportunidad madura o se descarta bien.</li>
                </ul>
              </div>

              <div className="broker-stats-card">
                <div>
                  <strong>{publicProperties.length}</strong>
                  <span className="muted">Propiedades publicadas</span>
                </div>
                <div>
                  <strong>{projectCount}</strong>
                  <span className="muted">Proyectos representados</span>
                </div>
                <div>
                  <strong>{availableCount}</strong>
                  <span className="muted">Activos disponibles</span>
                </div>
                <div>
                  <strong>{featuredProperties.length}</strong>
                  <span className="muted">Destacadas hoy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="page-shell">
            <div className="landing-section-heading">
              <div>
                <p className="eyebrow">Selecciones destacadas</p>
                <h2 className="section-title">Proyectos e inmuebles para empezar con mas certeza.</h2>
              </div>
              <p className="lede" style={{ maxWidth: "32rem", margin: 0 }}>
                Un primer frente de propiedades que ya llegan con narrativa, contexto y una mejor
                oportunidad de conversion a visita.
              </p>
            </div>

            {featuredProperties.length === 0 ? (
              <div className="copy-card">
                <p className="eyebrow">Sin inventario destacado</p>
                <p className="muted" style={{ margin: 0 }}>
                  Cuando entren nuevos inmuebles, esta franja mostrara las oportunidades mas
                  fuertes para abrir contacto.
                </p>
              </div>
            ) : (
              <div className="property-grid">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.slug} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
