import Link from "next/link";
import { hideProperty, upsertProperty } from "@/app/admin/actions";
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

type PropertyListItem = {
  id: string;
  active: boolean;
  href: string;
  title: string;
  description: string;
  commercialStatusLabel: string;
  isFeatured: boolean;
};

type Option = {
  value: string;
  label: string;
};

type SelectedProperty = {
  id: string;
  title: string;
  slug: string;
  projectId: string | null;
  propertyTypeId: string;
  listingMode: string;
  commercialStatus: string;
  priceMode: string;
  baseCurrency: string;
  priceAmount: number | null;
  whatsappPhone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  constructionAreaM2: number | null;
  lotAreaM2: number | null;
  approximateLocationText: string | null;
  summary: string | null;
  description: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
} | null;

type PropertyEditorProps = {
  createHref: string;
  items: PropertyListItem[];
  selectedLeadId: string | null;
  currentProjectId: string | null;
  currentPropertyId: string | null;
  selectedProjectId: string | null;
  selectedProperty: SelectedProperty;
  selectedPropertySummary: string | null;
  projectOptions: Option[];
  propertyTypeOptions: Option[];
  listingModeOptions: Option[];
  propertyStatusOptions: Option[];
  priceModeOptions: Option[];
  summaryLabel?: string;
};

export function PropertyEditor({
  createHref,
  items,
  selectedLeadId,
  currentProjectId,
  currentPropertyId,
  selectedProjectId,
  selectedProperty,
  selectedPropertySummary,
  projectOptions,
  propertyTypeOptions,
  listingModeOptions,
  propertyStatusOptions,
  priceModeOptions,
}: PropertyEditorProps) {
  return (
    <div className="admin-inventory-column">
      <Card className="admin-card admin-card--nested">
        <CardContent className="p-5">
          <PanelHeader
            eyebrow="Propiedades"
            title="Inventario editable"
            action={
              <Button asChild variant="secondary">
                <Link href={createHref}>Nueva propiedad</Link>
              </Button>
            }
          />

          <div className="admin-inventory-list">
            {items.length === 0 ? (
              <EmptyState eyebrow="Propiedades" description="Aun no hay propiedades cargadas." />
            ) : (
              items.map((property) => (
                <SelectionLink
                  key={property.id}
                  active={property.active}
                  href={property.href}
                  title={property.title}
                  description={property.description}
                  meta={
                    <>
                      <Badge variant="metric">{property.commercialStatusLabel}</Badge>
                      {property.isFeatured ? <Badge variant="metric">Destacada</Badge> : null}
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
          <p className="eyebrow">{selectedProperty ? "Editar propiedad" : "Crear propiedad"}</p>
          <form action={upsertProperty} className="admin-editor-form">
            <input name="propertyId" type="hidden" value={selectedProperty?.id ?? ""} />
            <input name="selectedLeadId" type="hidden" value={selectedLeadId ?? ""} />
            <input name="selectedProjectId" type="hidden" value={currentProjectId ?? ""} />
            <input name="selectedPropertyId" type="hidden" value={currentPropertyId ?? "new"} />

            <div className="admin-editor-form__split">
              <FormField label="Titulo">
                <Input defaultValue={selectedProperty?.title ?? ""} name="title" required />
              </FormField>
              <FormField label="Slug">
                <Input defaultValue={selectedProperty?.slug ?? ""} name="slug" placeholder="autogenerado" />
              </FormField>
            </div>

            <div className="admin-editor-form__quad">
              <FormField label="Proyecto">
                <NativeSelect defaultValue={selectedProperty?.projectId ?? selectedProjectId ?? ""} name="projectIdRef">
                  <option value="">Sin proyecto</option>
                  {projectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="Tipo">
                <NativeSelect defaultValue={selectedProperty?.propertyTypeId ?? propertyTypeOptions[0]?.value ?? ""} name="propertyTypeId" required>
                  {propertyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="Modo">
                <NativeSelect defaultValue={selectedProperty?.listingMode ?? "sale"} name="listingMode">
                  {listingModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="Estado comercial">
                <NativeSelect defaultValue={selectedProperty?.commercialStatus ?? "available"} name="commercialStatus">
                  {propertyStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
            </div>

            <div className="admin-editor-form__quad">
              <FormField label="Modo de precio">
                <NativeSelect defaultValue={selectedProperty?.priceMode ?? "fixed"} name="priceMode">
                  {priceModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="Moneda">
                <Input defaultValue={selectedProperty?.baseCurrency ?? "USD"} maxLength={3} name="baseCurrency" />
              </FormField>
              <FormField label="Precio">
                <Input defaultValue={selectedProperty?.priceAmount ?? ""} min="0" name="priceAmount" step="0.01" type="number" />
              </FormField>
              <FormField label="WhatsApp">
                <Input defaultValue={selectedProperty?.whatsappPhone ?? ""} name="whatsappPhone" />
              </FormField>
            </div>

            <div className="admin-editor-form__quad">
              <FormField label="Dormitorios">
                <Input defaultValue={selectedProperty?.bedrooms ?? ""} min="0" name="bedrooms" type="number" />
              </FormField>
              <FormField label="Banos">
                <Input defaultValue={selectedProperty?.bathrooms ?? ""} min="0" name="bathrooms" type="number" />
              </FormField>
              <FormField label="Parqueos">
                <Input defaultValue={selectedProperty?.parkingSpaces ?? ""} min="0" name="parkingSpaces" type="number" />
              </FormField>
              <FormField label="Area interior m2">
                <Input defaultValue={selectedProperty?.constructionAreaM2 ?? ""} min="0" name="constructionAreaM2" step="0.01" type="number" />
              </FormField>
            </div>

            <div className="admin-editor-form__split">
              <FormField label="Area de lote m2">
                <Input defaultValue={selectedProperty?.lotAreaM2 ?? ""} min="0" name="lotAreaM2" step="0.01" type="number" />
              </FormField>
              <FormField label="Ubicacion aproximada">
                <Input defaultValue={selectedProperty?.approximateLocationText ?? ""} name="approximateLocationText" />
              </FormField>
            </div>

            <FormField label="Resumen">
              <Textarea defaultValue={selectedProperty?.summary ?? ""} name="summary" rows={4} />
            </FormField>

            <FormField label="Descripcion">
              <Textarea defaultValue={selectedProperty?.description ?? ""} name="description" rows={6} />
            </FormField>

            <label className="admin-editor-form__check">
              <input defaultChecked={selectedProperty?.isFeatured ?? false} name="isFeatured" type="checkbox" />
              <span>Destacar esta propiedad dentro del catalogo publico.</span>
            </label>

            {selectedProperty ? (
              <Card className="copy-card" style={{ padding: "1rem 1.1rem" }}>
                <CardContent className="p-0">
                  <p className="muted" style={{ margin: 0 }}>{selectedPropertySummary}</p>
                </CardContent>
              </Card>
            ) : null}

            <div className="admin-editor-form__actions">
              <Button className="admin-editor-form__submit" type="submit">
                {selectedProperty ? "Guardar propiedad" : "Crear propiedad"}
              </Button>
              {selectedProperty ? (
                <Button className="admin-editor-form__danger" formAction={hideProperty} type="submit" variant="secondary">
                  Ocultar propiedad
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
