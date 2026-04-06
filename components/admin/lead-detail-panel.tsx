import Link from "next/link";
import { updateLeadStatus } from "@/app/admin/actions";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";

type LeadStatusOption = {
  value: string;
  label: string;
};

type LeadPropertyItem = {
  id: string;
  title: string;
  slug: string;
  commercialStatusLabel: string;
};

type LeadHistoryItem = {
  id: string;
  statusLabel: string;
  note: string | null;
  changedAt: string;
};

type SelectedLead = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  currentStatusLabel: string;
  currentStatusValue: string;
  source: string;
  createdAt: string;
  meetingInterest: boolean;
  sourcePath: string | null;
  message: string | null;
};

type LeadDetailPanelProps = {
  currentProjectId: string | null;
  currentPropertyId: string | null;
  selectedLead: SelectedLead | null;
  properties: LeadPropertyItem[];
  history: LeadHistoryItem[];
  statusOptions: LeadStatusOption[];
};

function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function LeadDetailPanel({
  currentProjectId,
  currentPropertyId,
  selectedLead,
  properties,
  history,
  statusOptions,
}: LeadDetailPanelProps) {
  if (!selectedLead) {
    return (
      <EmptyState
        eyebrow="Sin seleccion"
        description="Cuando entren leads, podras ver aqui el detalle y moverlos por etapa."
      />
    );
  }

  return (
    <>
      <Card className="admin-card admin-card--nested">
        <CardContent className="grid gap-4 p-5">
          <div className="chip-row">
            <Badge variant="chip">{selectedLead.currentStatusLabel}</Badge>
            <Badge variant="chip">{selectedLead.source}</Badge>
            {selectedLead.meetingInterest ? <Badge variant="chip">Quiere cita</Badge> : null}
          </div>

          <div>
            <p className="eyebrow">Lead seleccionado</p>
            <h2 className="section-title" style={{ fontSize: "2rem" }}>
              {selectedLead.fullName}
            </h2>
          </div>

          <div className="detail-meta">
            <Badge variant="metric">{selectedLead.phone}</Badge>
            {selectedLead.email ? <Badge variant="metric">{selectedLead.email}</Badge> : null}
            <Badge variant="metric">{formatLeadDate(selectedLead.createdAt)}</Badge>
          </div>

          <form action={updateLeadStatus} className="admin-status-form">
            <input name="leadId" type="hidden" value={selectedLead.id} />
            <input name="selectedLeadId" type="hidden" value={selectedLead.id} />
            <input name="selectedProjectId" type="hidden" value={currentProjectId ?? ""} />
            <input name="selectedPropertyId" type="hidden" value={currentPropertyId ?? ""} />
            <FormField className="admin-status-form__field" label="Cambiar estado">
              <NativeSelect defaultValue={selectedLead.currentStatusValue} name="status">
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <Button className="admin-status-form__submit" type="submit">
              Guardar estado
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="admin-card admin-card--nested">
        <CardContent className="grid gap-4 p-5">
          <p className="eyebrow">Contexto comercial</p>
          <div style={{ display: "grid", gap: "0.9rem" }}>
            <div>
              <strong>Origen</strong>
              <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                {selectedLead.sourcePath ?? "Sin ruta de origen"}
              </p>
            </div>
            <div>
              <strong>Mensaje</strong>
              <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                {selectedLead.message ?? "Sin mensaje adicional."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="admin-card admin-card--nested">
        <CardContent className="grid gap-4 p-5">
          <p className="eyebrow">Propiedades de interes</p>
          <div style={{ display: "grid", gap: "0.9rem" }}>
            {properties.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                Este lead no tiene propiedades enlazadas.
              </p>
            ) : (
              properties.map((property) => (
                <div key={property.id} className="admin-list-item">
                  <div>
                    <strong>{property.title}</strong>
                    <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                      {property.commercialStatusLabel}
                    </p>
                  </div>
                  <div className="admin-list-item__meta">
                    <Button asChild variant="tertiary">
                      <Link href={`/propiedades/${property.slug}`}>Ver ficha</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="admin-card admin-card--nested">
        <CardContent className="grid gap-4 p-5">
          <p className="eyebrow">Historial</p>
          <div style={{ display: "grid", gap: "0.9rem" }}>
            {history.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                Aun no hay cambios registrados para este lead.
              </p>
            ) : (
              history.map((historyItem) => (
                <div key={historyItem.id} className="admin-list-item">
                  <div>
                    <strong>{historyItem.statusLabel}</strong>
                    <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                      {historyItem.note ?? "Cambio generado por workflow del sistema."}
                    </p>
                  </div>
                  <div className="admin-list-item__meta">
                    <span className="muted">{formatLeadDate(historyItem.changedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
