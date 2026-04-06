import Link from "next/link";
import { archiveProject, upsertProject } from "@/app/admin/actions";
import { PanelHeader } from "@/components/admin/admin-primitives";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { SelectionLink } from "@/components/shared/selection-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

type ProjectListItem = {
  id: string;
  active: boolean;
  href: string;
  name: string;
  headline: string | null;
  statusLabel: string;
  isFeatured: boolean;
};

type ProjectOption = {
  value: string;
  label: string;
};

type SelectedProject = {
  id: string;
  name: string;
  slug: string;
  status: string;
  sortOrder: number;
  whatsappPhone: string | null;
  headline: string | null;
  approximateLocationText: string | null;
  summary: string | null;
  description: string | null;
  isFeatured: boolean;
} | null;

type ProjectEditorProps = {
  createHref: string;
  items: ProjectListItem[];
  selectedLeadId: string | null;
  currentProjectId: string | null;
  currentPropertyId: string | null;
  selectedProject: SelectedProject;
  statusOptions: ProjectOption[];
};

export function ProjectEditor({
  createHref,
  items,
  selectedLeadId,
  currentProjectId,
  currentPropertyId,
  selectedProject,
  statusOptions,
}: ProjectEditorProps) {
  return (
    <div className="admin-inventory-column">
      <Card className="admin-card admin-card--nested">
        <CardContent className="p-5">
          <PanelHeader
            eyebrow="Proyectos"
            title="Control editorial"
            action={
              <Button asChild variant="secondary">
                <Link href={createHref}>Nuevo proyecto</Link>
              </Button>
            }
          />

          <div className="admin-inventory-list">
            {items.length === 0 ? (
              <EmptyState eyebrow="Proyectos" description="Aun no hay proyectos cargados." />
            ) : (
              items.map((project) => (
                <SelectionLink
                  key={project.id}
                  active={project.active}
                  href={project.href}
                  title={project.name}
                  description={project.headline ?? "Sin headline editorial"}
                  meta={
                    <>
                      <Badge variant="metric">{project.statusLabel}</Badge>
                      {project.isFeatured ? <Badge variant="metric">Destacado</Badge> : null}
                    </>
                  }
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="admin-card admin-card--nested">
        <CardContent className="p-5">
          <p className="eyebrow">{selectedProject ? "Editar proyecto" : "Crear proyecto"}</p>
          <form action={upsertProject} className="admin-editor-form">
            <input name="projectId" type="hidden" value={selectedProject?.id ?? ""} />
            <input name="selectedLeadId" type="hidden" value={selectedLeadId ?? ""} />
            <input name="selectedProjectId" type="hidden" value={currentProjectId ?? "new"} />
            <input name="selectedPropertyId" type="hidden" value={currentPropertyId ?? ""} />

            <div className="admin-editor-form__split">
              <FormField label="Nombre">
                <Input defaultValue={selectedProject?.name ?? ""} name="name" required />
              </FormField>
              <FormField label="Slug">
                <Input defaultValue={selectedProject?.slug ?? ""} name="slug" placeholder="autogenerado" />
              </FormField>
            </div>

            <div className="admin-editor-form__triple">
              <FormField label="Estado">
                <NativeSelect defaultValue={selectedProject?.status ?? "draft"} name="status">
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="Orden">
                <Input defaultValue={String(selectedProject?.sortOrder ?? 0)} min="0" name="sortOrder" type="number" />
              </FormField>
              <FormField label="WhatsApp">
                <Input defaultValue={selectedProject?.whatsappPhone ?? ""} name="whatsappPhone" />
              </FormField>
            </div>

            <FormField label="Headline">
              <Input defaultValue={selectedProject?.headline ?? ""} name="headline" />
            </FormField>

            <FormField label="Ubicacion aproximada">
              <Input defaultValue={selectedProject?.approximateLocationText ?? ""} name="approximateLocationText" />
            </FormField>

            <FormField label="Resumen">
              <Textarea defaultValue={selectedProject?.summary ?? ""} name="summary" rows={4} />
            </FormField>

            <FormField label="Descripcion">
              <Textarea defaultValue={selectedProject?.description ?? ""} name="description" rows={6} />
            </FormField>

            <label className="admin-editor-form__check">
              <input defaultChecked={selectedProject?.isFeatured ?? false} name="isFeatured" type="checkbox" />
              <span>Marcar como proyecto destacado en la portada.</span>
            </label>

            <div className="admin-editor-form__actions">
              <Button className="admin-editor-form__submit" type="submit">
                {selectedProject ? "Guardar proyecto" : "Crear proyecto"}
              </Button>
              {selectedProject ? (
                <Button className="admin-editor-form__danger" formAction={archiveProject} type="submit" variant="secondary">
                  Archivar proyecto
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
