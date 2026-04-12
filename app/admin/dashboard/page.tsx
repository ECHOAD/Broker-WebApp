import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <Card className="admin-card admin-card--wide">
      <CardContent className="p-6">
        <header className="admin-editor-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h2 className="section-title" style={{ fontSize: "2rem" }}>
              Panel de Control
            </h2>
          </div>
        </header>

        <p className="text-secondary mt-4">
          Usa el menú lateral para navegar a Leads, Proyectos o Propiedades.
        </p>
      </CardContent>
    </Card>
  );
}
