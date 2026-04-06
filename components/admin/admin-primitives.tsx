import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SnapshotGrid } from "@/components/shared/snapshot-grid";

type AdminAccessDeniedProps = {
  catalogHref?: string;
  favoritesHref?: string;
};

export function AdminAccessDenied({
  catalogHref = "/catalogo",
  favoritesHref = "/favoritos",
}: AdminAccessDeniedProps) {
  return (
    <Card className="admin-card" style={{ maxWidth: "52rem", margin: "0 auto" }}>
      <CardContent className="grid gap-4 p-6">
        <p className="eyebrow">Acceso restringido</p>
        <h1 className="section-title">Esta zona requiere rol broker_admin.</h1>
        <p className="muted">
          La sesion esta activa, pero el perfil actual no tiene permisos para ver leads, cierres ni
          operacion interna.
        </p>
        <div className="chip-row" style={{ marginTop: "1rem" }}>
          <Button asChild>
            <Link href={catalogHref}>Volver al catalogo</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={favoritesHref}>Ir a favoritos</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type AdminHeroProps = {
  currentProfileLabel: string;
  snapshot: Array<{ label: string; value: string }>;
};

export function AdminHero({ currentProfileLabel, snapshot }: AdminHeroProps) {
  return (
    <section className="admin-hero">
      <div className="admin-banner">
        <div />
        <p className="eyebrow" style={{ color: "rgba(255,255,255,0.72)" }}>
          Workspace admin
        </p>
        <h1 className="section-title" style={{ color: "white", maxWidth: "12ch" }}>
          Operacion comercial clara y control editorial en una sola vista.
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: "34rem", lineHeight: 1.8 }}>
          Lectura real desde Supabase para leads, proyectos y propiedades. La sesion actual entra
          como {currentProfileLabel}.
        </p>
      </div>

      <SnapshotGrid metrics={snapshot} />
    </section>
  );
}

type PipelinePanelProps = {
  pipeline: Array<{ stage: string; count: number }>;
};

export function PipelinePanel({ pipeline }: PipelinePanelProps) {
  return (
    <Card className="admin-card">
      <CardContent className="p-6">
        <p className="eyebrow">Pipeline</p>
        <h2 className="section-title" style={{ fontSize: "2rem" }}>
          Leads por etapa
        </h2>
        <div style={{ display: "grid", gap: "0.9rem", marginTop: "1rem" }}>
          {pipeline.map((entry) => (
            <div
              key={entry.stage}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.1rem",
                borderRadius: "18px",
                background: "var(--surface-soft)",
              }}
            >
              <span>{entry.stage}</span>
              <strong>{entry.count}</strong>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type PanelHeaderProps = {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
};

export function PanelHeader({ eyebrow, title, action }: PanelHeaderProps) {
  return (
    <div className="admin-editor-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title" style={{ fontSize: "2rem" }}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
