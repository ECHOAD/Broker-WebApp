import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="page-shell">
      <div className="footer-panel">
        <div className="footer-grid">
          <div>
            <p className="eyebrow">Carlos Realto</p>
            <h2 className="section-title">Propiedades, proyectos y acompanamiento comercial con mejor criterio.</h2>
          </div>

          <div>
            <p className="muted">
              Explora el catalogo, revisa propiedades destacadas y entra en contacto cuando una
              oportunidad tenga sentido para ti.
            </p>
            <div className="chip-row" style={{ marginTop: "1rem" }}>
              <Button asChild variant="tertiary">
                <Link href="/catalogo">Ver catalogo</Link>
              </Button>
              <Button asChild variant="tertiary">
                <Link href="/favoritos">Revisar favoritos</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
