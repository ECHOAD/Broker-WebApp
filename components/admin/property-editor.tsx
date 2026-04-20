"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  hideProperty,
  registerUploadedPropertyMedia,
  removeUploadedPropertyStorage,
  savePropertyDetails,
} from "@/app/admin/properties/actions";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "./image-uploader";
import { uploadPropertyFilesDirect } from "./property-media-upload";

type Option = {
  value: string;
  label: string;
  slug?: string;
};

type PropertyMedia = {
  id: string;
  storage_path: string;
  is_cover: boolean;
};

type DynamicFeature = {
  id: string;
  group: string;
  label: string;
  value: string;
};

type InventorySummaryOption = {
  id: string;
  modelName: string;
  lotSizeMinM2: number | null;
  lotSizeMaxM2: number | null;
  habitableAreaM2: number | null;
  constructionAreaM2: number | null;
  priceMin: number | null;
  priceMax: number | null;
  availableLots: number;
  totalLots: number;
  bedrooms: number | null;
  bathrooms: number | null;
  statusNote: string | null;
  isActive: boolean;
};

type SelectedProperty = {
  id: string;
  inventorySummaryId: string | null;
  title: string;
  slug: string;
  projectId: string | null;
  propertyTypeId: string;
  listingMode: string;
  commercialStatus: string;
  priceMode: string;
  baseCurrency: string;
  priceAmount: number | null;
  priceMinAmount: number | null;
  priceMaxAmount: number | null;
  whatsappPhone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  constructionAreaM2: number | null;
  lotAreaM2: number | null;
  lotAreaMinM2: number | null;
  lotAreaMaxM2: number | null;
  approximateLocationText: string | null;
  summary: string | null;
  description: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
  customFeatures: Array<{
    group?: string;
    label: string;
    value: string;
  }>;
  media?: PropertyMedia[];
} | null;

type PropertyEditorProps = {
  selectedLeadId: string | null;
  currentProjectId: string | null;
  currentPropertyId: string | null;
  selectedProjectId: string | null;
  selectedProperty: SelectedProperty;
  selectedPropertySummary: string | null;
  projectOptions: Option[];
  inventorySummaryOptions?: InventorySummaryOption[];
  propertyTypeOptions: Option[];
  listingModeOptions: Option[];
  propertyStatusOptions: Option[];
  priceModeOptions: Option[];
  summaryLabel?: string;
};

export function PropertyEditor({
  selectedLeadId,
  currentProjectId,
  currentPropertyId,
  selectedProjectId,
  selectedProperty,
  selectedPropertySummary,
  projectOptions,
  inventorySummaryOptions = [],
  propertyTypeOptions,
  listingModeOptions,
  propertyStatusOptions,
  priceModeOptions,
}: PropertyEditorProps) {
  const activeProjectLabel = projectOptions.find((option) => option.value === selectedProjectId)?.label ?? "Proyecto activo";
  const initialPropertyTypeId = selectedProperty?.propertyTypeId ?? propertyTypeOptions[0]?.value ?? "";
  const initialPropertyTypeSlug = propertyTypeOptions.find((option) => option.value === initialPropertyTypeId)?.slug ?? "";
  const initialPriceMode = selectedProperty?.priceMode ?? (initialPropertyTypeSlug === "lot" ? "range" : "fixed");
  const formRef = useRef<HTMLFormElement>(null);
  const pendingMediaInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(null);
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState(initialPropertyTypeId);
  const [selectedInventorySummaryId, setSelectedInventorySummaryId] = useState(selectedProperty?.inventorySummaryId ?? "");
  const [selectedPriceMode, setSelectedPriceMode] = useState(initialPriceMode);
  const [priceAmount, setPriceAmount] = useState(selectedProperty?.priceAmount?.toString() ?? "");
  const [priceMinAmount, setPriceMinAmount] = useState(
    selectedProperty?.priceMinAmount?.toString() ?? selectedProperty?.priceAmount?.toString() ?? "",
  );
  const [priceMaxAmount, setPriceMaxAmount] = useState(
    selectedProperty?.priceMaxAmount?.toString() ?? selectedProperty?.priceAmount?.toString() ?? "",
  );
  const [bedrooms, setBedrooms] = useState(selectedProperty?.bedrooms?.toString() ?? "");
  const [bathrooms, setBathrooms] = useState(selectedProperty?.bathrooms?.toString() ?? "");
  const [parkingSpaces, setParkingSpaces] = useState(selectedProperty?.parkingSpaces?.toString() ?? "");
  const [constructionAreaM2, setConstructionAreaM2] = useState(selectedProperty?.constructionAreaM2?.toString() ?? "");
  const [lotAreaM2, setLotAreaM2] = useState(selectedProperty?.lotAreaM2?.toString() ?? "");
  const [lotAreaMinM2, setLotAreaMinM2] = useState(
    selectedProperty?.lotAreaMinM2?.toString() ?? selectedProperty?.lotAreaM2?.toString() ?? "",
  );
  const [lotAreaMaxM2, setLotAreaMaxM2] = useState(
    selectedProperty?.lotAreaMaxM2?.toString() ?? selectedProperty?.lotAreaM2?.toString() ?? "",
  );
  const [dynamicFeatures, setDynamicFeatures] = useState<DynamicFeature[]>(
    (selectedProperty?.customFeatures?.length ? selectedProperty.customFeatures : [{ group: "", label: "", value: "" }]).map(
      (feature, index) => ({
        id: `${index}-${feature.label}-${feature.value}`,
        group: feature.group ?? "",
        label: feature.label,
        value: feature.value,
      }),
    ),
  );
  const selectedPropertyType = propertyTypeOptions.find((option) => option.value === selectedPropertyTypeId);
  const selectedPropertyTypeSlug = selectedPropertyType?.slug ?? "";
  const isLot = selectedPropertyTypeSlug === "lot";
  const isBuilding = selectedPropertyTypeSlug === "building";
  const isVilla = selectedPropertyTypeSlug === "villa" || (!isLot && !isBuilding);
  const showBedroomsAndBathrooms = isVilla;
  const showParking = isVilla || isBuilding;
  const showConstructionArea = isVilla || isBuilding || isLot;
  const showLotArea = isVilla || isLot || isBuilding;
  const showFixedPrice = selectedPriceMode === "fixed";
  const showPriceRange = selectedPriceMode === "range";
  const [pendingMediaFiles, setPendingMediaFiles] = useState<File[]>([]);
  const serializedDynamicFeatures = JSON.stringify(
    dynamicFeatures
      .map((feature) => ({
        group: feature.group.trim(),
        label: feature.label.trim(),
        value: feature.value.trim(),
      }))
      .filter((feature) => feature.label && feature.value),
  );

  function handlePendingMediaChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPendingMediaFiles(Array.from(event.target.files ?? []));
  }

  function updateDynamicFeature(id: string, field: keyof Omit<DynamicFeature, "id">, value: string) {
    setDynamicFeatures((features) =>
      features.map((feature) => (feature.id === id ? { ...feature, [field]: value } : feature)),
    );
  }

  function addDynamicFeature() {
    setDynamicFeatures((features) => [
      ...features,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, group: "", label: "", value: "" },
    ]);
  }

  function removeDynamicFeature(id: string) {
    setDynamicFeatures((features) =>
      features.length === 1
        ? [{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, group: "", label: "", value: "" }]
        : features.filter((feature) => feature.id !== id),
    );
  }

  function formatSummaryNumber(value: number | null) {
    if (value === null || value === undefined) {
      return null;
    }

    return new Intl.NumberFormat("es-DO", {
      maximumFractionDigits: value % 1 === 0 ? 0 : 1,
    }).format(value);
  }

  function buildInventorySummaryLabel(summary: InventorySummaryOption) {
    const lotMin = formatSummaryNumber(summary.lotSizeMinM2);
    const lotMax = formatSummaryNumber(summary.lotSizeMaxM2);
    const lotLabel = lotMin && lotMax && lotMin !== lotMax ? `${lotMin}-${lotMax} m2` : `${lotMin ?? lotMax ?? "sin lote"} m2`;
    const availabilityLabel =
      summary.totalLots > 0 && summary.totalLots !== summary.availableLots
        ? `${summary.availableLots}/${summary.totalLots} disponibles`
        : `${summary.availableLots} disponibles`;

    return `${summary.modelName} | ${lotLabel} | ${availabilityLabel}`;
  }

  function getConstructionAreaLabel() {
    if (isLot) {
      return "Area habilitable m2";
    }

    return isBuilding ? "Area construida m2" : "Area interior m2";
  }

  function addOrUpdateDynamicFeature(label: string, value: string, group = "Inventario") {
    setDynamicFeatures((features) => {
      const cleanValue = value.trim();
      if (!cleanValue) {
        return features;
      }

      const existingIndex = features.findIndex((feature) => feature.label.toLowerCase() === label.toLowerCase());
      if (existingIndex >= 0) {
        return features.map((feature, index) =>
          index === existingIndex ? { ...feature, group, label, value: cleanValue } : feature,
        );
      }

      const hasOnlyEmptyFeature = features.length === 1 && !features[0].label && !features[0].value;
      const nextFeature = {
        id: `${Date.now()}-${label}`,
        group,
        label,
        value: cleanValue,
      };

      return hasOnlyEmptyFeature ? [nextFeature] : [...features, nextFeature];
    });
  }

  function applyInventorySummary(summaryId: string) {
    setSelectedInventorySummaryId(summaryId);
    const summary = inventorySummaryOptions.find((item) => item.id === summaryId);

    if (!summary) {
      return;
    }

    setPriceAmount(summary.priceMin?.toString() ?? "");
    setPriceMinAmount(summary.priceMin?.toString() ?? "");
    setPriceMaxAmount(summary.priceMax?.toString() ?? "");
    if (summary.priceMax !== null && summary.priceMax !== summary.priceMin) {
      setSelectedPriceMode("range");
    }
    setBedrooms(summary.bedrooms?.toString() ?? "");
    setBathrooms(summary.bathrooms?.toString() ?? "");
    setConstructionAreaM2((summary.habitableAreaM2 ?? summary.constructionAreaM2)?.toString() ?? "");
    setLotAreaM2(summary.lotSizeMinM2?.toString() ?? "");
    setLotAreaMinM2(summary.lotSizeMinM2?.toString() ?? "");
    setLotAreaMaxM2(summary.lotSizeMaxM2?.toString() ?? "");
    addOrUpdateDynamicFeature("Modelo", summary.modelName);

    if (summary.statusNote) {
      addOrUpdateDynamicFeature("Estado del modelo", summary.statusNote);
    }
  }

  function handlePropertyTypeChange(propertyTypeId: string) {
    setSelectedPropertyTypeId(propertyTypeId);
    const nextType = propertyTypeOptions.find((option) => option.value === propertyTypeId);

    if (nextType?.slug === "lot") {
      setSelectedPriceMode("range");
      setPriceMinAmount(priceMinAmount || priceAmount);
      setPriceMaxAmount(priceMaxAmount || priceAmount);
      setLotAreaMinM2(lotAreaMinM2 || lotAreaM2);
      setLotAreaMaxM2(lotAreaMaxM2 || lotAreaM2);
      return;
    }

    if (nextType?.slug !== "lot" && lotAreaM2 === "" && lotAreaMinM2) {
      setLotAreaM2(lotAreaMinM2);
    }
  }

  function handlePriceModeChange(priceMode: string) {
    setSelectedPriceMode(priceMode);

    if (priceMode === "range") {
      setPriceMinAmount(priceMinAmount || priceAmount);
      setPriceMaxAmount(priceMaxAmount || priceAmount);
      return;
    }

    if (priceMode === "fixed") {
      setPriceAmount(priceAmount || priceMinAmount);
      return;
    }

    if (priceMode === "on_request") {
      setPriceAmount("");
      setPriceMinAmount("");
      setPriceMaxAmount("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setUploadProgress(pendingMediaFiles.length > 0 ? { completed: 0, total: pendingMediaFiles.length } : null);
    let uploadedPaths: string[] = [];

    try {
      const formData = new FormData(event.currentTarget);
      formData.delete("mediaFiles");
      const result = await savePropertyDetails(formData);

      if (pendingMediaFiles.length > 0) {
        uploadedPaths = await uploadPropertyFilesDirect(result.propertyId, pendingMediaFiles, setUploadProgress);
        await registerUploadedPropertyMedia(result.propertyId, uploadedPaths);
        setPendingMediaFiles([]);
        if (pendingMediaInputRef.current) {
          pendingMediaInputRef.current.value = "";
        }
      }

      router.push(result.editPath);
      router.refresh();
    } catch (error) {
      console.error("Property save failed:", error);
      if (uploadedPaths.length > 0) {
        await removeUploadedPropertyStorage(uploadedPaths);
      }
      alert("No pudimos guardar la propiedad. Revisa los datos e intenta de nuevo.");
    } finally {
      setIsSaving(false);
      setUploadProgress(null);
    }
  }

  async function handleHideProperty() {
    if (!selectedProperty || !formRef.current) {
      return;
    }

    if (!confirm("Quieres ocultar esta propiedad?")) {
      return;
    }

    const formData = new FormData(formRef.current);
    await hideProperty(formData);
  }

  return (
      <Card className="admin-card admin-card--wide">
        <CardContent className="p-5">
          <p className="eyebrow">{selectedProperty ? "Editar inmueble" : "Nueva propiedad del proyecto"}</p>
          {!selectedProperty ? (
            <p className="muted m-0">
              Completa esta ficha para agregar una unidad dentro del proyecto activo.
            </p>
          ) : null}
          <form ref={formRef} onSubmit={handleSubmit} className="admin-editor-form">
            <input name="propertyId" type="hidden" value={selectedProperty?.id ?? ""} />
            <input name="selectedLeadId" type="hidden" value={selectedLeadId ?? ""} />
            <input name="selectedProjectId" type="hidden" value={currentProjectId ?? ""} />
            <input name="selectedPropertyId" type="hidden" value={currentPropertyId ?? "new"} />
            {selectedProjectId ? <input name="projectIdRef" type="hidden" value={selectedProjectId} /> : null}

            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="eyebrow">Imagenes</p>
                  <p className="muted m-0">
                    Sube las fotos primero. En edicion puedes ordenar, cambiar portada o eliminar imagenes existentes.
                  </p>
                </div>
                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50">
                  <input
                    accept="image/*"
                    className="sr-only"
                    disabled={isSaving}
                    multiple
                    onChange={handlePendingMediaChange}
                    ref={pendingMediaInputRef}
                    type="file"
                  />
                  Seleccionar imagenes
                </label>
              </div>
              {pendingMediaFiles.length > 0 ? (
                <div className="mt-4 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="m-0 font-semibold text-slate-800">
                    {pendingMediaFiles.length} imagen{pendingMediaFiles.length === 1 ? "" : "es"} lista
                    {pendingMediaFiles.length === 1 ? "" : "s"} para guardar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pendingMediaFiles.map((file) => (
                      <span key={`${file.name}-${file.lastModified}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs">
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {uploadProgress ? (
                <p className="mt-4 text-sm text-slate-500">
                  Subiendo {uploadProgress.completed} de {uploadProgress.total} imagenes directo a Supabase.
                </p>
              ) : null}
              {selectedProperty ? (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <ImageUploader propertyId={selectedProperty.id} initialMedia={selectedProperty.media ?? []} />
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-slate-50/60 p-5">
              <div className="mb-5 flex flex-col gap-1">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Tipo de inmueble
                </p>
                <p className="m-0 text-sm text-slate-500">
                  Primero define si es lote, villa o edificio. Luego el formulario muestra solo los campos necesarios.
                </p>
              </div>

              <div className="admin-editor-form__quad">
              {selectedProjectId ? (
                <FormField label="Proyecto">
                  <div className="flex min-h-11 items-center rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                    {activeProjectLabel}
                  </div>
                </FormField>
              ) : (
                <FormField label="Proyecto">
                  <NativeSelect defaultValue={selectedProperty?.projectId ?? ""} name="projectIdRef">
                    <option value="">Sin proyecto</option>
                    {projectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </NativeSelect>
                </FormField>
              )}
              <FormField label="Tipo">
                <NativeSelect
                  value={selectedPropertyTypeId}
                  name="propertyTypeId"
                  onChange={(event) => handlePropertyTypeChange(event.target.value)}
                  required
                >
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

              {inventorySummaryOptions.length > 0 ? (
                <div className="mt-5 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
                <FormField label="Tipologia / lote base">
                  <NativeSelect
                    name="inventorySummaryId"
                    onChange={(event) => applyInventorySummary(event.target.value)}
                    value={selectedInventorySummaryId}
                  >
                    <option value="">Sin modelo asociado</option>
                    {inventorySummaryOptions.map((summary) => (
                      <option key={summary.id} value={summary.id}>
                        {buildInventorySummaryLabel(summary)}
                      </option>
                    ))}
                  </NativeSelect>
                </FormField>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  El modelo autocompleta precio, lote y habitabilidad. Puedes ajustar cada valor debajo para esta unidad.
                </p>
              </div>
              ) : (
                <input name="inventorySummaryId" type="hidden" value="" />
              )}
            </div>

            <div className="admin-editor-form__split">
              <FormField label="Titulo">
                <Input defaultValue={selectedProperty?.title ?? ""} name="title" required />
              </FormField>
              <FormField label="Slug">
                <Input defaultValue={selectedProperty?.slug ?? ""} name="slug" placeholder="autogenerado" />
              </FormField>
            </div>

            <div className="admin-editor-form__quad">
              <FormField label="Modo de precio">
                <NativeSelect
                  name="priceMode"
                  onChange={(event) => handlePriceModeChange(event.target.value)}
                  value={selectedPriceMode}
                >
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
              {showPriceRange ? (
                <>
                  <FormField label="Precio desde">
                    <Input
                      min="0"
                      name="priceMinAmount"
                      onChange={(event) => {
                        setPriceMinAmount(event.target.value);
                        setPriceAmount(event.target.value);
                      }}
                      step="0.01"
                      type="number"
                      value={priceMinAmount}
                    />
                  </FormField>
                  <FormField label="Precio hasta">
                    <Input
                      min="0"
                      name="priceMaxAmount"
                      onChange={(event) => setPriceMaxAmount(event.target.value)}
                      step="0.01"
                      type="number"
                      value={priceMaxAmount}
                    />
                  </FormField>
                </>
              ) : null}
              {showFixedPrice ? (
                <FormField label="Precio">
                  <Input
                    min="0"
                    name="priceAmount"
                    onChange={(event) => setPriceAmount(event.target.value)}
                    step="0.01"
                    type="number"
                    value={priceAmount}
                  />
                </FormField>
              ) : null}
              {selectedPriceMode === "on_request" ? (
                <div className="flex min-h-11 items-center rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-500">
                  El precio no se publica. Se mostrara como precio a solicitud.
                </div>
              ) : null}
              <FormField label="WhatsApp">
                <Input defaultValue={selectedProperty?.whatsappPhone ?? ""} name="whatsappPhone" />
              </FormField>
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-slate-50/60 p-5">
              <div className="mb-5 flex flex-col gap-1">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Caracteristicas para {selectedPropertyType?.label ?? "este tipo"}
                </p>
                <p className="m-0 text-sm text-slate-500">
                  Solo mostramos los campos utiles para el tipo de inmueble seleccionado.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {showBedroomsAndBathrooms ? (
                  <>
                    <FormField label="Dormitorios">
                      <Input
                        min="0"
                        name="bedrooms"
                        onChange={(event) => setBedrooms(event.target.value)}
                        type="number"
                        value={bedrooms}
                      />
                    </FormField>
                    <FormField label="Banos">
                      <Input
                        min="0"
                        name="bathrooms"
                        onChange={(event) => setBathrooms(event.target.value)}
                        type="number"
                        value={bathrooms}
                      />
                    </FormField>
                  </>
                ) : null}

                {showParking ? (
                  <FormField label="Parqueos">
                    <Input
                      min="0"
                      name="parkingSpaces"
                      onChange={(event) => setParkingSpaces(event.target.value)}
                      type="number"
                      value={parkingSpaces}
                    />
                  </FormField>
                ) : null}

                {showConstructionArea ? (
                  <FormField label={getConstructionAreaLabel()}>
                    <Input
                      min="0"
                      name="constructionAreaM2"
                      onChange={(event) => setConstructionAreaM2(event.target.value)}
                      step="0.01"
                      type="number"
                      value={constructionAreaM2}
                    />
                  </FormField>
                ) : null}

                {showLotArea ? (
                  isLot ? (
                    <>
                      <FormField label="Lote desde m2">
                        <Input
                          min="0"
                          name="lotAreaMinM2"
                          onChange={(event) => {
                            setLotAreaMinM2(event.target.value);
                            setLotAreaM2(event.target.value);
                          }}
                          step="0.01"
                          type="number"
                          value={lotAreaMinM2}
                        />
                      </FormField>
                      <FormField label="Lote hasta m2">
                        <Input
                          min="0"
                          name="lotAreaMaxM2"
                          onChange={(event) => setLotAreaMaxM2(event.target.value)}
                          step="0.01"
                          type="number"
                          value={lotAreaMaxM2}
                        />
                      </FormField>
                    </>
                  ) : (
                    <FormField label="Area de terreno m2">
                      <Input
                        min="0"
                        name="lotAreaM2"
                        onChange={(event) => setLotAreaM2(event.target.value)}
                        step="0.01"
                        type="number"
                        value={lotAreaM2}
                      />
                    </FormField>
                  )
                ) : null}
              </div>
            </div>

            <div className="admin-editor-form__split">
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

            <div className="rounded-[2rem] border border-slate-100 bg-slate-50/60 p-5">
              <input name="customFeaturesJson" type="hidden" value={serializedDynamicFeatures} />
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="eyebrow">Caracteristicas abiertas</p>
                  <p className="muted m-0">
                    Agrega datos libres como amenidades, vista, mobiliario, piso, terminaciones o condiciones especiales.
                  </p>
                </div>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                  onClick={addDynamicFeature}
                  type="button"
                >
                  Agregar caracteristica
                </button>
              </div>

              <div className="grid gap-3">
                {dynamicFeatures.map((feature, index) => (
                  <div key={feature.id} className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-3 lg:grid-cols-[1fr_1.2fr_1.4fr_auto]">
                    <FormField label={index === 0 ? "Grupo" : "Grupo opcional"}>
                      <Input
                        onChange={(event) => updateDynamicFeature(feature.id, "group", event.target.value)}
                        placeholder="Amenidades"
                        value={feature.group}
                      />
                    </FormField>
                    <FormField label="Caracteristica">
                      <Input
                        onChange={(event) => updateDynamicFeature(feature.id, "label", event.target.value)}
                        placeholder="Piscina privada"
                        value={feature.label}
                      />
                    </FormField>
                    <FormField label="Valor">
                      <Input
                        onChange={(event) => updateDynamicFeature(feature.id, "value", event.target.value)}
                        placeholder="Si / incluida / 2 niveles"
                        value={feature.value}
                      />
                    </FormField>
                    <div className="flex items-end">
                      <button
                        className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => removeDynamicFeature(feature.id)}
                        type="button"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
              <Button
                className="admin-editor-form__submit border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-950 shadow-sm"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Guardando..." : selectedProperty ? "Guardar propiedad" : "Crear propiedad"}
              </Button>
              {selectedProperty ? (
                <Button className="admin-editor-form__danger" disabled={isSaving} onClick={handleHideProperty} type="button" variant="secondary">
                  Ocultar propiedad
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
  );
}
