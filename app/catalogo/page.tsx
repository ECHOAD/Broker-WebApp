import { Suspense } from "react";
import { SitePage } from "@/components/layout/site-page";
import { CatalogView } from "@/components/catalog/catalog-view";
import { listPublicProperties } from "@/lib/properties";

export const revalidate = 300;

export default async function CatalogoPage() {
  const properties = await listPublicProperties();

  return (
    <SitePage>
      <Suspense fallback={<div className="py-20 text-center font-serif italic text-muted">Cargando catálogo...</div>}>
        <CatalogView properties={properties} />
      </Suspense>
    </SitePage>
  );
}
